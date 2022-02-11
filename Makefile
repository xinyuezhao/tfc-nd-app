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
	rm -f node
	rm -f cluster
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
	rm -f polaris_image.tar.gz
	rm -f rigel_image.tar.gz
	rm -rf imported*
	rm -rf deployment/intersight/onprem/argo-build
	rm -rf deployment/docker/intersight/clustermgr/config.json
	rm -rf deployment/docker/intersight/clustermgr/rigel
	rm -rf deployment/docker/intersight/nodemgr/config.json
	rm -rf deployment/docker/intersight/nodemgr/polaris
	rm -rf deployment/intersight/onprem/polaris/.build/
	rm -rf deployment/intersight/onprem/rigel/.build/
	rm -rf polaris-onprem.tar.gz
	rm -rf rigel-onprem.tar.gz


bundle:
	wget http://aci-artifactory-001.insieme.local:8081/artifactory/argo-artifactory/argo-bundle.tar.gz
	tar zxvf argo-bundle.tar.gz --directory pkg/
	rm argo-bundle.tar.gz

$(eval $(call build-for-linux,sanity))
sanity: go test -c ./testsuite
	rm -rf testsuite.test

services: organization agent agentpool credentials

organization: generate
	go build ./cmd/organization

agent: generate
	go build ./cmd/agent

agentpool: generate
	go build ./cmd/agentpool

credentials: generate
	go build ./cmd/credentials

# This is used for Nexus Dashboard and kind.
$(eval $(call build-for-linux,docker-images))
docker-images: bundle services
	docker build --file deployment/docker/organizationmgr/Dockerfile --tag organizationmgr:v29 .
	docker build --file deployment/docker/agentmgr/Dockerfile --tag agentmgr:v29 .
	docker build --file deployment/docker/agentpoolmgr/Dockerfile --tag agentpoolmgr:v29 .
	docker build --file deployment/docker/credentialsmgr/Dockerfile --tag credentialsmgr:v29 .
	docker build --file deployment/docker/ui/Dockerfile --tag ui:v1 .

docker-nap: bundle services
	docker build --file deployment/docker/organizationmgr/Dockerfile --tag containers.cisco.com/cn-ecosystem/tf-nd-app-organizationmgr:v0.0.1 .
	docker build --file deployment/docker/agentmgr/Dockerfile --tag containers.cisco.com/cn-ecosystem/tf-nd-app-agentmgr:v0.0.1 .
	docker build --file deployment/docker/agentpoolmgr/Dockerfile --tag containers.cisco.com/cn-ecosystem/tf-nd-app-agentpoolmgr:v0.0.1 .
	docker build --file deployment/docker/credentialsmgr/Dockerfile --tag containers.cisco.com/cn-ecosystem/tf-nd-app-credentialsmgr:v0.0.1 .
#	docker build --file deployment/docker/ui/Dockerfile --tag containers.cisco.com/cn-ecosystem/tf-nd-app-ui:v0.0.1 .

docker-archive: docker-images
	docker save organizationmgr:v29 agentmgr:v29 agentpoolmgr:v29 credentialsmgr:v29 hashicorp/tfc-agent:latest ui:v1 | gzip > images.tar.gz

docker-push: docker-nap
	docker push containers.cisco.com/cn-ecosystem/tf-nd-app-organizationmgr:v0.0.1
	docker push containers.cisco.com/cn-ecosystem/tf-nd-app-agentmgr:v0.0.1
	docker push containers.cisco.com/cn-ecosystem/tf-nd-app-agentpoolmgr:v0.0.1
	docker push containers.cisco.com/cn-ecosystem/tf-nd-app-credentialsmgr:v0.0.1
#	docker push containers.cisco.com/cn-ecosystem/tf-nd-app-ui:v0.0.1

zap-build:
	./zap-dynamic build src:zap-config/ oci:build --sign-pki-key ~/.ssh/dcappcenter_staging_key.pem --author dev

zap-pack: zap-build
	./zap-dynamic pack oci:build/Terraform zap-archive:build/Terraform_Connect-1.0.0.100.nap --media-dir ./Media --sign-pki-key ~/.ssh/dcappcenter_staging_key.pem --author dev

.PHONY: generate lint test terraform services
