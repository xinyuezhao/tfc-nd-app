FROM alpine:latest
WORKDIR /bin/
COPY ./node .
COPY ./config.json .
COPY ./config_kind.json .
CMD ./node --config.file ./config.json
