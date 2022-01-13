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
	rm -f node
	rm -f cluster
	rm -f organization
	rm -f agent
	rm -f agentpool
	rm -f credentials
	rm -f testsuite
	rm -rf argo
	rm -rf pkg/bundle
	rm -f images.tar.gz
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
sanity: clean lint docker-images
	go test -c ./cmd/testsuite
	docker build --file deployment/docker/testsuite/Dockerfile --tag terraform-testsuite:v1 .
	rm -rf testsuite.test
	./deployment/sanity/scripts/sanity.sh

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
	docker build --file deployment/docker/organizationmgr/Dockerfile --tag organizationmgr:v11 .
	docker build --file deployment/docker/agentmgr/Dockerfile --tag agentmgr:v11 .
	docker build --file deployment/docker/agentpoolmgr/Dockerfile --tag agentpoolmgr:v11 .
	docker build --file deployment/docker/credentialsmgr/Dockerfile --tag credentialsmgr:v11 .

docker-archive: docker-images
	docker save organizationmgr:v11 agentmgr:v11 agentpoolmgr:v11 credentialsmgr:v11 hashicorp/tfc-agent:latest | gzip > images.tar.gz

.PHONY: generate lint test terraform services
