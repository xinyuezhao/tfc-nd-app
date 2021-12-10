FROM alpine:latest
WORKDIR /security/
COPY pkg/bundle/client.cer.pem .
COPY pkg/bundle/client.key.pem .
COPY pkg/bundle/server.cer.pem .
WORKDIR /bin/
COPY ./organization .
COPY cmd/organization/config.json .
COPY cmd/organization/config_kind.json .
COPY .bin/deployment-spec.terraform.argo.cisco.com.v1.Terraform.organization-manager-kind-config.json config_sanity.json
CMD ./organization --config.file ./config.json
