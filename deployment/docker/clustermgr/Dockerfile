FROM alpine:latest
WORKDIR /bin/
COPY ./cluster .
COPY ./config.json .
CMD ./cluster --config.file ./config.json
