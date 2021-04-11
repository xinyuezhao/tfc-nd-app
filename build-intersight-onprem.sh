#!/usr/bin/env bash
make clean
make argo
make generate
GOOS=linux GOARCH=amd64 make services
make intersight
make -C deployment/intersight/onprem/polaris
make -C deployment/intersight/onprem/rigel
