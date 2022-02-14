# Nexus Dashboard Connector for Terraform

## Deploying on Nexus Dashboard

### Build Application Bundle

In order to deploy the application on Nexus Dashboard, we need to create a .aci application bundle. This can be achieved using the following steps:

```sh
make clean
make argo
make generate
GOOS=linux GOARCH=amd64 make services
make docker-images
make -C deployment/nd
```

This should generate a `cisco-terraform-v0.0.1.aci` file in the top-level directory. Take this application bundle and install it using the Nexus Dashboard UI (under Service Catalog).

There is a helper script that will do the above for you at the top-level directory - build-nd.sh

### Interacting with REST API

The following steps require [httpie](https://httpie.io/) command line utility to be installed.

```
$ echo '{"userName": "admin", "userPasswd": "ins3965!", "domain": "DefaultAuth"}' | http --verify=no --session=nd https://172.31.187.83/login
```

You can query organizations from organizationmgr using the following request.

```
$ http --verify=no --session=nd https://172.31.187.83/sedgeapi/v1/cisco-terraform/organizationmgr/api/terraform.cisco.com/v1/organizations
```

You can query a specific agentpool from agentpoolmgr using the following request.

```
$ http --verify=no --session=nd https://172.31.187.83/sedgeapi/v1/cisco-terraform/agentpoolmgr/api/terraform.cisco.com/v1/agentpools/organization/{{organization name}}/agentpool/{{agentpool name}}
```

An agent can be posted as follows.

```
$ echo '{"spec": {"description": "description for agent", "name": "agent_without_token", "organization": {{organization name}}, "agentpool": {{agentpool name}}}}' | http --verify=no --session=nd https://172.31.187.83/sedgeapi/v1/cisco-terraform/nodemgr/api/terraform.cisco.com/v1/agents
```

Once the agent is created, query the agent resource to verify that.

```
$ http --verify=no --session=nd https://172.31.187.83/sedgeapi/v1/cisco-terraform/nodemgr/api/terraform.cisco.com/v1/agents/agent_without_token
HTTP/1.1 200 OK
Content-Length: 469
Content-Type: application/json
Date: Thu, 21 Dec 2021 00:30:12 GMT
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Powered-By: argo.cisco.com
X-Ratelimit-Limit: 0
X-Ratelimit-Remaining: 0
X-Ratelimit-Reset: 0
X-Request-Id: 94f4225a-e75b-4285-a172-40a638567a46
X-Xss-Protection: 1; mode=block

{
    "meta": {
        "id": "terraform.cisco.com/v1.Agent/a2c2290e-db75-4bc4-a5d7-0e45b100d46a",
        "specGenID": 2,
        "statusGenID": 0,
        "status": 3,
        "resourceVersion": 2,
        "labels": {},
        "annotations": {},
        "deleteTimestamp": "",
        "finalizers": {},
        "org": "ARGO-FW-TENANT",
        "domain": "",
        "namespace": "",
        "key": "terraform.cisco.com/v1.Agent"
    },
    "spec": {
        "description": "description for agent",
        "tokenId": "",
        "agentpool": "",
        "agentpoolId": "",
        "organization": "",
        "name": "agent_without_token",
        "token": "********",
        "status": "created",
        "agentId": ""
    }
}
```
