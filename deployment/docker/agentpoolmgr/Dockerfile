FROM alpine:latest
RUN apk --no-cache add curl
WORKDIR /security/
COPY pkg/bundle/client.cer.pem .
COPY pkg/bundle/client.key.pem .
COPY pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./agentpool .
COPY services/agentpool/config.json .
CMD ./agentpool --config.file ./config.json
