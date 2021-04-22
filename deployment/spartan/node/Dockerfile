FROM alpine:latest
WORKDIR /security/
COPY ./pkg/bundle/client.cer.pem .
COPY ./pkg/bundle/client.key.pem .
COPY ./pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./node .
COPY ./deployment/spartan/node/config.json .
CMD ./node --config.file ./config.json
