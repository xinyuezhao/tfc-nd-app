#!/usr/bin/env bash
export CGO_ENABLED=0
make clean -C ../../../
GOOS=linux GOARCH=amd64 make services -C ../../../
make intersight -C ../../../
make clean 
make clean -C polaris
make clean -C rigel
make argo-build 
make -C polaris
make -C rigel
