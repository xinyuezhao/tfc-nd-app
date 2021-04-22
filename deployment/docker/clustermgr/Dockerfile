FROM alpine:latest
WORKDIR /security/
COPY pkg/bundle/client.cer.pem .
COPY pkg/bundle/client.key.pem .
COPY pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./cluster .
COPY cmd/cluster/config.json .
COPY cmd/cluster/config_kind.json .
COPY cmd/cluster/config_sanity.json .
CMD ./cluster --config.file ./config.json
