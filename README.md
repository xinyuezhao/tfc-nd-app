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
$ echo '{"userName": "admin", "userPasswd": "ins3965!", "domain": "DefaultAuth"}' | http --verify=no --session=nd https://10.0.0.0/login
```

You can query organizations from organizationmgr using the following request.

```
$ http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/organizations
```

You can query a specific organization from organizationmgr using the following request.

```
$ http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/organizations/{{organization_name}}
```

You can query agentpools under an organization from agentpoolmgr using the following request.

```
$ http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/organization/{{organization_name}}/agentpools
```

You can query a specific agentpool by organization name and agentpool name from agentpoolmgr using the following request.

```
$ http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/organization/{{org_name}}/agentpool/{{agentpool_name}}
```

You can query a specific agentpool by agentpool id from agentpoolmgr using the following request.

```
$ http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/agentpool/{{agentpool_id}}
```

An agentpool can be posted as follows.

```
$ echo '{"spec": {"organization": {{organization_name}}, "name": {{agentpool_name}}}}' | http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/agentpools
```

Once the agentpool is created, query the agentpool resource to verify.

```
$ http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/organization/{{organization_name}}/agentpool/{{agentpool_name}}
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
        "id": "",
        "specGenID": 0,
        "statusGenID": 0,
        "status": 0,
        "resourceVersion": 0,
        "labels": {},
        "annotations": {},
        "deleteTimestamp": "",
        "finalizers": {},
        "org": "",
        "domain": "",
        "namespace": "",
        "key": "terraform.cisco.com/v1.Agentpool"
    },
    "spec": {
        "name": {{agentpool_name}},
        "id": "apool-xxx",
        "organization": {{organization_name}}
    }
}
```

You can query agents under an agentpool using the following request.

```
$ http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/agents
```

You can query a specific agent by agent name using the following request.

```
$ http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/agents/{{agent_name}}
```

An agent created with agent token given.

```
$ echo '{"spec": {"description": {{agent_description}}, "token": {{agent_token_given}}, "name": {{agent_name}}}}' | http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/agents
```

An agent created without agent token.

```
$ echo '{"spec": {"description": {{agent_description}}, "name": {{agent_name}}, "organization": {{organization_name}}, "agentpool": {{agentpool_name}}}}' | http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/agents
```

An agent can be deleted as follows.

```
$ http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/agents/{{agent_name}}
```

An user token for terraform cloud API can be post as follows.

```
$ echo '{"spec": {"name": "terraform", "token": {{user_token_string}}}}' | http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/credentials
```

An user token can be quired as follows.

```
$ http --verify=no --session=nd https://10.0.0.0/appcenter/cisco/terraform/api/v1/credentials/terraform
```