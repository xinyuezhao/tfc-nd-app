#!/usr/bin/env bash
make clean
make argo
make generate
GOOS=linux GOARCH=amd64 make services
make docker-images
make -C deployment/nd
