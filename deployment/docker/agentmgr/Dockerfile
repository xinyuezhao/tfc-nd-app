FROM alpine:latest
RUN apk --no-cache add curl
WORKDIR /security/
COPY pkg/bundle/client.cer.pem .
COPY pkg/bundle/client.key.pem .
COPY pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./agent .
COPY cmd/agent/config.json .
CMD ./agent --config.file ./config.json
