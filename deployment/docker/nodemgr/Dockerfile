FROM alpine:latest
WORKDIR /security/
COPY pkg/bundle/client.cer.pem .
COPY pkg/bundle/client.key.pem .
COPY pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./node .
COPY cmd/node/config.json .
COPY cmd/node/config_kind.json .
COPY .bin/deployment-spec.argome.argo.cisco.com.v1.Argome.node-manager-kind-config.json config_sanity.json
CMD ./node --config.file ./config.json
