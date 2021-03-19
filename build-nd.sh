#!/usr/bin/env bash
make clean
make docker-archive
make -C deployment/nd
