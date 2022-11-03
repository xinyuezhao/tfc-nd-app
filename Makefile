# Copyright (c) 2020 Cisco Systems Inc. All rights reserved.

BINDIR=$(CURDIR)/.bin
LINTER=$(BINDIR)/golangci-lint
GENERATOR=$(BINDIR)/argen
DEPLOYMENT_SPEC_PATH_PREFIX=$(BINDIR)/deployment-spec

define build-for-linux
$(1): export CGO_ENABLED=0
$(1): export GOOS=linux
$(1): export GOARCH=amd64
endef

all: lint terraform

check: lint

$(BINDIR):
	@mkdir -p $@

$(BINDIR)/%: | $(BINDIR)
	env -u GOOS -u GOARCH GOBIN=$(BINDIR) go install $(CMD)

$(LINTER): CMD=github.com/golangci/golangci-lint/cmd/golangci-lint

$(GENERATOR): CMD=golang.cisco.com/argo/cmd/argen

cache:
	go mod download

# TODO: Fix the hardcoding of argo ddN path.
generate: | $(GENERATOR)
	$(GENERATOR) run -r ./model/remote.yaml -m ./model/terraform -g ./gen -d $(DEPLOYMENT_SPEC_PATH_PREFIX)

lint: | $(LINTER) generate
	$(LINTER) run ./...

clean:
	rm -rf $(BINDIR)
	rm -rf $(CURDIR)/gen
	rm -rf build
	rm -f organization
	rm -f agent
	rm -f agentpool
	rm -f credentials
	rm -rf argo
	rm -rf pkg/bundle
	rm -f images.tar.gz
	rm -f images.tar.gzdocker
	rm -rf .build
	rm -f cisco-terraform-v*.aci
	rm -rf imported*

bundle:
	wget http://aci-artifactory-001.insieme.local:8081/artifactory/argo-artifactory/argo-bundle.tar.gz
	tar zxvf argo-bundle.tar.gz --directory pkg/
	rm argo-bundle.tar.gz

$(eval $(call build-for-linux,sanity))
sanity: go test -c ./testsuite
	rm -rf testsuite.test

services: organization agent agentpool credentials

organization: generate
	go build ./services/organization

agent: generate
	go build ./services/agent

agentpool: generate
	go build ./services/agentpool

credentials: generate
	go build ./services/credentials

# This is used for Nexus Dashboard and kind.
$(eval $(call build-for-linux,docker-images))
docker-images: bundle services
	docker build --file deployment/docker/organizationmgr/Dockerfile --tag organizationmgr:v0.1.6 .
	docker build --file deployment/docker/agentmgr/Dockerfile --tag agentmgr:v0.1.5 .
	docker build --file deployment/docker/agentpoolmgr/Dockerfile --tag agentpoolmgr:v0.1.3 .
	docker build --file deployment/docker/credentialsmgr/Dockerfile --tag credentialsmgr:v0.1.3 .
	docker build --file deployment/docker/ui/Dockerfile --tag ui:v0.1.8 services/ui/

docker-nap: bundle services
	docker build --file deployment/docker/organizationmgr/Dockerfile --tag containers.cisco.com/cn-ecosystem/tf-nd-app-organizationmgr:v0.1.6 .
	docker build --file deployment/docker/agentmgr/Dockerfile --tag containers.cisco.com/cn-ecosystem/tf-nd-app-agentmgr:v0.1.5 .
	docker build --file deployment/docker/agentpoolmgr/Dockerfile --tag containers.cisco.com/cn-ecosystem/tf-nd-app-agentpoolmgr:v0.1.3 .
	docker build --file deployment/docker/credentialsmgr/Dockerfile --tag containers.cisco.com/cn-ecosystem/tf-nd-app-credentialsmgr:v0.1.3 .
	docker build --file deployment/docker/ui/Dockerfile --tag containers.cisco.com/cn-ecosystem/tf-nd-app-ui:v0.1.8 .

docker-archive: docker-images
	docker save organizationmgr:v0.1.6 agentmgr:v0.1.5 agentpoolmgr:v0.1.3 credentialsmgr:v0.1.3 hashicorp/tfc-agent:1.4.0 ui:v0.1.8  | gzip > images.tar.gz

docker-push: docker-nap
	docker push containers.cisco.com/cn-ecosystem/tf-nd-app-organizationmgr:v0.1.6
	docker push containers.cisco.com/cn-ecosystem/tf-nd-app-agentmgr:v0.1.5
	docker push containers.cisco.com/cn-ecosystem/tf-nd-app-agentpoolmgr:v0.1.3
	docker push containers.cisco.com/cn-ecosystem/tf-nd-app-credentialsmgr:v0.1.3
	docker push containers.cisco.com/cn-ecosystem/tf-nd-app-ui:v0.1.8

zap-build:
	./zap-dynamic build src:zap-config/ oci:build --sign-pki-key ~/.ssh/dcappcenter_staging_key.pem --author dev

zap-pack: zap-build
	./zap-dynamic pack oci:build/Terraform zap-archive:build/Terraform_Connect-1.0.0.100.nap --media-dir ./Media --sign-pki-key ~/.ssh/dcappcenter_staging_key.pem --author dev

.PHONY: generate lint test terraform services
