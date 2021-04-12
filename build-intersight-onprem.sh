#!/usr/bin/env bash
export CGO_ENABLED=0
make clean
make argo
make argo-build
make generate
GOOS=linux GOARCH=amd64 make services
make intersight
make clean -C deployment/intersight/onprem/polaris
make clean -C deployment/intersight/onprem/rigel
make -C deployment/intersight/onprem/polaris
make -C deployment/intersight/onprem/rigel
