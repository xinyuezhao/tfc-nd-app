# Copyright (c) 2022 Cisco Systems Inc. All rights reserved.

build: docker-image docker-push

docker-image:
	docker build -t containers.cisco.com/cn-ecosystem/tf-nd-app-ui .

docker-push:
	docker push containers.cisco.com/cn-ecosystem/tf-nd-app-ui\:latest