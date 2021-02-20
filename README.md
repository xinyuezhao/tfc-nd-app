# argome - A multi-service application demo using argo

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

This should generate a `cisco-argome-v0.0.1.aci` file in the top-level directory. Take this application bundle and install it using the Nexus Dashboard UI (under Service Catalog).

There is a helper script that will do the above for you at the top-level directory - build-nd.sh

### Interacting with REST API

The following steps require [httpie](https://httpie.io/) command line utility to be installed.

```
$ echo '{"userName": "admin", "userPasswd": "ins3965!", "domain": "DefaultAuth"}' | http --verify=no --session=nd https://10.195.219.173/login
```

You can query nodes from nodemgr using the following request.

```
$ http --verify=no --session=nd https://10.195.219.173/sedgeapi/v1/cisco-argome/nodemgr/api/argome.argo.cisco.com/v1/nodes
```

You can query clusters from clustermgr using the following request.

```
$ http --verify=no --session=nd https://10.195.219.173/sedgeapi/v1/cisco-argome/clustermgr/api/argome.argo.cisco.com/v1/clusters
```

A node can be posted as follows.

```
$ echo '{"inbandIP": "192.168.1.102", "name": "node2", "cluster": "/argome.argo.cisco.com/v1/clusters/cluster-1"}' | http --verify=no --session=nd https://10.195.219.173/sedgeapi/v1/cisco-argome/nodemgr/api/argome.argo.cisco.com/v1/nodes
```

Once the node is created, clustermgr gets notified and it admits the node. Query the nodeopers resource to verify that. You should see the `status` field in the node resource to say `admitted`.

```
$ http --verify=no --session=nd https://10.195.219.173/sedgeapi/v1/cisco-argome/nodemgr/api/argome.argo.cisco.com/v1/nodeopers
HTTP/1.1 200 OK
Content-Length: 312
Content-Type: application/json
Date: Thu, 21 Jan 2021 00:30:12 GMT
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Powered-By: argo.cisco.com
X-Ratelimit-Limit: 0
X-Ratelimit-Remaining: 0
X-Ratelimit-Reset: 0
X-Request-Id: 94f4225a-e75b-4285-a172-40a638567a46
X-Xss-Protection: 1; mode=block

[
    {
        "cluster": "/v1/clusters/cluster-1",
        "inbandIP": "192.168.1.102",
        "meta": {
            "annotations": {},
            "deleteTimestamp": "",
            "finalizers": {},
            "group": "",
            "id": "9bf78c21-ba62-4809-8707-3d8a4cb5e16f",
            "key": "argome.argo.cisco.com/v1.NodeOper",
            "labels": {},
            "namespace": "",
            "org": "",
            "resourceVersion": 2,
            "status": 3
        },
        "status": "admitted"
    }
]
```

## Deploying on Intersight

TBD

## Deploying on Kind

TBD
