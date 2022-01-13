FROM alpine:latest
WORKDIR /security/
COPY pkg/bundle/client.cer.pem .
COPY pkg/bundle/client.key.pem .
COPY pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./credentials .
COPY cmd/credentials/config.json .
CMD ./credentials --config.file ./config.json
