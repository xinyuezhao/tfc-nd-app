C3_BASE_VERSION=0.3.15
REPO_DIR=$(shell git rev-parse --show-toplevel)
DEPL_DIR=${REPO_DIR}/deployment/nd
BUILD_DIR=${REPO_DIR}/.build
VERSION=v0.1.9

all: package

.PHONY: package
.ONESHELL:
package:
	rm -f cisco-terraform-${VERSION}.aci
	mkdir -p ${BUILD_DIR}/terraform/Image
	cp -a ${DEPL_DIR}/meta/* ${BUILD_DIR}/terraform/
	cp ${REPO_DIR}/images.tar.gz ${BUILD_DIR}/terraform/Image
	cd ${BUILD_DIR} && zip -r ../cisco-terraform-${VERSION}.aci terraform

clean:
	-stacker clean --all
	-rm -rf ${BUILD_DIR}
	-rm -f cisco-terraform-*.aci
