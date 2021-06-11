REPO_DIR=$(shell git rev-parse --show-toplevel)
ARGO_BUILD_INTERSIGHT=${REPO_DIR}/deployment/intersight/onprem/argo-build/intersight
ARGO_BUILD_SCRIPT=${ARGO_BUILD_INTERSIGHT}/script
ARGO_BUILD_ONPREM=${ARGO_BUILD_INTERSIGHT}/onprem

# need to replace the following variable definitions
SERVICE=rigel
SERVICE_DIR=${REPO_DIR}/deployment/intersight/onprem/${SERVICE}
SERVICE_BUILD_DIR=${SERVICE_DIR}/.build
BUILD_DIR=${SERVICE_BUILD_DIR}/${SERVICE}


#specify the kafka topic definition file
KAFKA_TOPICS_FILE=${SERVICE_DIR}/kafka-topics.txt


all: package

.PHONY: package
.ONESHELL:
package:
	rm -f ${REPO_DIR}/${SERVICE}-onprem.tar.gz
	rm -f ${SERVICE_BUILD_DIR}
	mkdir -p ${BUILD_DIR}
	cp ${ARGO_BUILD_ONPREM}/install.sh ${BUILD_DIR}/
	cp ${ARGO_BUILD_ONPREM}/uninstall.sh ${BUILD_DIR}/
	cp -R ${ARGO_BUILD_ONPREM}/ansible ${BUILD_DIR}/
	cp ${ARGO_BUILD_ONPREM}/update.sh ${BUILD_DIR}/
	cp -R ${ARGO_BUILD_ONPREM}/kafka ${BUILD_DIR}/
	cp -R ${ARGO_BUILD_ONPREM}/k8s-specs ${BUILD_DIR}/
	${ARGO_BUILD_SCRIPT}/replace.sh -f ${BUILD_DIR}/install.sh -s aegis -r ${SERVICE}
	${ARGO_BUILD_SCRIPT}/replace.sh -f ${BUILD_DIR}/uninstall.sh -s aegis -r ${SERVICE}
	${ARGO_BUILD_SCRIPT}/replace.sh -f ${BUILD_DIR}/update.sh -s aegis -r ${SERVICE}
	${ARGO_BUILD_SCRIPT}/replace.sh -f ${BUILD_DIR}/ansible/onprem-master.yml -s aegis -r ${SERVICE}
	${ARGO_BUILD_SCRIPT}/replace.sh -f ${BUILD_DIR}/k8s-specs/sts.yaml -s aegis -r ${SERVICE}
	${ARGO_BUILD_SCRIPT}/replace.sh -f ${BUILD_DIR}/k8s-specs/service.yaml  -s aegis -r ${SERVICE}
	cp ${REPO_DIR}/${SERVICE}_image.tar.gz ${BUILD_DIR}
	cp ${KAFKA_TOPICS_FILE} ${BUILD_DIR}/kafka/
	cd ${BUILD_DIR}/../; tar -cvzf ${REPO_DIR}/${SERVICE}-onprem.tar.gz .
clean:
	-stacker clean --all
	-rm -f ${REPO_DIR}/${SERVICE}-onprem.tar.gz
	-rm -rf  ${SERVICE_BUILD_DIR}

