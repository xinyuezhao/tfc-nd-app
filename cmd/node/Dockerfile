FROM alpine:latest
WORKDIR /security/
COPY ./pkg/bundle/client.cer.pem .
COPY ./pkg/bundle/client.key.pem .
COPY ./pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./node .
COPY ./cmd/node/config_sanity.json ./config.json
CMD ./node --config.file ./config.json
