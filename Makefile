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

services: clusterd node organization agent agentpool

clusterd: generate
	go build ./cmd/cluster

node: generate
	go build ./cmd/node

organization: generate
	go build ./cmd/organization

agent: generate
	go build ./cmd/agent

agentpool: generate
	go build ./cmd/agentpool

# This is used for Nexus Dashboard and kind.
$(eval $(call build-for-linux,docker-images))
docker-images: bundle services
	docker build --file deployment/docker/nodemgr/Dockerfile --tag nodemgr:v11 .
	docker build --file deployment/docker/clustermgr/Dockerfile --tag clustermgr:v11 .
	docker build --file deployment/docker/organizationmgr/Dockerfile --tag organizationmgr:v11 .
	docker build --file deployment/docker/agentmgr/Dockerfile --tag agentmgr:v11 .
	docker build --file deployment/docker/agentpoolmgr/Dockerfile --tag agentpoolmgr:v11 .

docker-archive: docker-images
	docker save nodemgr:v11 clustermgr:v11 organizationmgr:v11 agentmgr:v11 agentpoolmgr:v11 hashicorp/tfc-agent:latest | gzip > images.tar.gz

intersight: docker-archive
	cp node deployment/docker/intersight/nodemgr/polaris
	cp cmd/node/config.json deployment/docker/intersight/nodemgr/
	docker build --tag polaris:v1 deployment/docker/intersight/nodemgr

	cp cluster deployment/docker/intersight/clustermgr/rigel
	cp cmd/cluster/config.json deployment/docker/intersight/clustermgr
	docker build --tag rigel:v1 deployment/docker/intersight/clustermgr

	docker save polaris:v1 | gzip > polaris_image.tar.gz
	docker save rigel:v1 | gzip > rigel_image.tar.gz

deploy-on-kind: docker-images
	kind get clusters | grep -E "^argo$$" || (echo 'No kind cluster found for argo. Run `kind create cluster --name argo`'; exit 1)
	kind load docker-image nodemgr:v1 --name argo
	kind load docker-image clustermgr:v1 --name argo

	kubectl --context kind-argo delete --ignore-not-found -f deployment/kind/all-in-one.yaml
	kubectl --context kind-argo apply -f deployment/kind/all-in-one.yaml

spartan: clean bundle generate
	GOOS=linux GOARCH=amd64 go build ./cmd/cluster
	GOOS=linux GOARCH=amd64 go build ./cmd/node
	docker build --file deployment/spartan/node/Dockerfile --tag terraform-spartan-node:v1 .
	docker build --file deployment/spartan/clusterd/Dockerfile --tag terraform-spartan-cluster:v1 .
	rm node
	rm cluster

.PHONY: generate lint test terraform services
