FROM alpine:latest
WORKDIR /security/
COPY pkg/bundle/client.cer.pem .
COPY pkg/bundle/client.key.pem .
COPY pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./agentpool .
COPY cmd/agentpool/config.json .
COPY cmd/agentpool/config_kind.json .
COPY .bin/deployment-spec.terraform.argo.cisco.com.v1.Terraform.agentpool-manager-kind-config.json config_sanity.json
CMD ./agentpool --config.file ./config.json
