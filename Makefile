# Copyright (c) 2020 Cisco Systems Inc. All rights reserved.

BINDIR=$(CURDIR)/.bin
LINTER=$(BINDIR)/golangci-lint
GENERATOR=$(BINDIR)/argen

all: argo lint test argome

check: lint test

$(BINDIR):
	@mkdir -p $@

$(BINDIR)/%: | $(BINDIR)
	env GOBIN=$(BINDIR) go install $(CMD)

$(LINTER): CMD=github.com/golangci/golangci-lint/cmd/golangci-lint

$(GENERATOR): CMD=golang.cisco.com/argo/cmd/argen

# TODO: Fix the hardcoding of argo ddN path.
generate: | $(GENERATOR)
	$(GENERATOR) run -m ./argo/ddN -m ./model -g ./gen

lint: | $(LINTER) generate
	$(LINTER) run ./...

clean:
	rm -rf $(BINDIR)
	rm -rf $(CURDIR)/gen
	rm -f node
	rm -f cluster 
	rm -f testsuite 
	rm -f pilot 
	rm -rf argo
	rm -rf pkg/bundle 
	rm -f images.tar.gz
	rm -rf .build
	rm -f cisco-argome-v0.0.1.aci
	rm -f polaris_image.tar.gz
	rm -f rigel_image.tar.gz

docker-node: clean argo 
	docker build --file cmd/node/Dockerfile --tag node-manager:v1 .

docker-cluster: clean argo 
	docker build --file cmd/cluster/Dockerfile --tag cluster:v1 .

docker-testsuite: clean argo
	docker build --file cmd/testsuite/Dockerfile --tag argome-testsuite:v1 .

argo:
	cp -R ../argo .

argo-build:
	cp -R ../argo-build .

bundle:
	wget http://aci-artifactory-001.insieme.local:8081/artifactory/argo-artifactory/argo-bundle.tar.gz
	tar zxvf argo-bundle.tar.gz --directory pkg/
	rm argo-bundle.tar.gz

sanity: clean argo bundle generate lint
	GOOS=linux GOARCH=amd64 go build ./cmd/cluster
	GOOS=linux GOARCH=amd64 go build ./cmd/node
	GOOS=linux GOARCH=amd64 go build ./cmd/testsuite
	docker build --file cmd/node/Dockerfile --tag node-manager:v1 .
	docker build --file cmd/cluster/Dockerfile --tag cluster:v1 .
	rm -rf $(BINDIR)
	rm -rf $(CURDIR)/gen
	docker build --file cmd/testsuite/Dockerfile --tag argome-testsuite:v1 .
	./runtest.sh

clusterd: argo
	go build ./cmd/cluster

node: argo
	go build ./cmd/node

services: clusterd node pilot

docker-images:
	cp node deployment/docker/nodemgr
	cp cmd/node/config.json deployment/docker/nodemgr
	docker build --tag nodemgr:v1 deployment/docker/nodemgr

	cp cluster deployment/docker/clustermgr
	cp cmd/cluster/config.json deployment/docker/clustermgr
	docker build --tag clustermgr:v1 deployment/docker/clustermgr

	docker save nodemgr:v1 clustermgr:v1 | gzip > images.tar.gz

intersight:
	cp node deployment/docker/intersight/nodemgr/polaris
	cp cmd/node/config.json deployment/docker/intersight/nodemgr/
	docker build --tag polaris:v1 deployment/docker/intersight/nodemgr

	cp cluster deployment/docker/intersight/clustermgr/rigel
	cp cmd/cluster/config.json deployment/docker/intersight/clustermgr
	docker build --tag rigel:v1 deployment/docker/intersight/clustermgr

	docker save polaris:v1 | gzip > polaris_image.tar.gz
	docker save rigel:v1 | gzip > rigel_image.tar.gz


.PHONY: generate lint test argome services
