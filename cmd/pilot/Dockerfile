FROM alpine:latest
WORKDIR /security/
COPY ./pkg/bundle/client.cer.pem .
COPY ./pkg/bundle/client.key.pem .
COPY ./pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./pilot .
COPY ./cmd/pilot/config.json .
CMD ./pilot --config.file ./config.json