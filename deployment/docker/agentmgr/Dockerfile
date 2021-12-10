FROM alpine:latest
WORKDIR /security/
COPY pkg/bundle/client.cer.pem .
COPY pkg/bundle/client.key.pem .
COPY pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./agent .
COPY cmd/agent/config.json .
COPY cmd/agent/config_kind.json .
COPY .bin/deployment-spec.terraform.argo.cisco.com.v1.Terraform.agent-manager-kind-config.json config_sanity.json
CMD ./agent --config.file ./config.json
