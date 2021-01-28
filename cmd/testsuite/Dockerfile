FROM golang:1.15.6-alpine3.12
RUN apk add --update make
RUN apk add build-base 
WORKDIR /go/src/app
COPY . .
RUN make generate
WORKDIR /go/src/app/cmd/testsuite
CMD go test 
