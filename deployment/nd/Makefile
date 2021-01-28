C3_BASE_VERSION=0.3.15
REPO_DIR=$(shell git rev-parse --show-toplevel)
DEPL_DIR=${REPO_DIR}/deployment/nd
BUILD_DIR=${REPO_DIR}/.build
VERSION=v0.0.1

all: package

.PHONY: package
.ONESHELL:
package:
	rm -f cisco-argome-${VERSION}.aci
	mkdir -p ${BUILD_DIR}/argome/Image
	cp -a ${DEPL_DIR}/meta/* ${BUILD_DIR}/argome/
	cp ${REPO_DIR}/images.tar.gz ${BUILD_DIR}/argome/Image
	cd ${BUILD_DIR} && zip -r ../cisco-argome-${VERSION}.aci argome

clean:
	-stacker clean --all
	-rm -rf ${BUILD_DIR}
	-rm -f cisco-argome-*.aci
