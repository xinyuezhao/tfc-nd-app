FROM alpine:latest
RUN apk --no-cache add curl
WORKDIR /security/
COPY pkg/bundle/client.cer.pem .
COPY pkg/bundle/client.key.pem .
COPY pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./organization .
COPY services/organization/config.json .
CMD ./organization --config.file ./config.json
