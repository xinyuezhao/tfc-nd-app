FROM alpine:latest
WORKDIR /security/
COPY pkg/bundle/client.cer.pem .
COPY pkg/bundle/client.key.pem .
COPY pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./agentpool .
COPY cmd/agentpool/config.json .
COPY cmd/agentpool/config_kind.json .
COPY cmd/agentpool/config_sanity.json .
CMD ./agentpool --config.file ./config.json