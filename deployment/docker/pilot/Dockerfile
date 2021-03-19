FROM alpine:latest
WORKDIR /bin/
COPY ./pilot .
COPY ./config.json .
COPY ./config_kind.json .
CMD ./pilot --config.file ./config.json
