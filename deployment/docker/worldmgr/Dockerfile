FROM alpine:latest
WORKDIR /security/
COPY pkg/bundle/client.cer.pem .
COPY pkg/bundle/client.key.pem .
COPY pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./world .
COPY cmd/world/config.json .
COPY cmd/world/config_kind.json .
COPY cmd/world/config_sanity.json .
CMD ./world --config.file ./config.json