FROM alpine:latest
WORKDIR /security/
COPY ./pkg/bundle/client.cer.pem .
COPY ./pkg/bundle/client.key.pem .
COPY ./pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./cluster .
COPY ./deployment/spartan/clusterd/config.json .
CMD ./cluster --config.file ./config.json