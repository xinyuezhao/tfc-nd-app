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

## Deploying on kind

You can deploy argome on a local kind cluster by using the `deploy-on-kind` make
target. If you haven't configured the kind cluster yet, refer to the next
section on how to setup a kind cluster.

```
make deploy-on-kind
```

### Setup kind Cluster (Only Initial Setup)

[kind](https://kind.sigs.k8s.io/) is a tool for running local Kubernetes
clusters using Docker container “nodes”. Follow the [official
documentation](https://kind.sigs.k8s.io/docs/user/quick-start#installation) to
install kind.

Create a new cluster named `argo` to use for argo specific projects.

```
kind create cluster --name argo
```

argo services require Kafka and MongoDB. To install Kafka and MongoDB, use
[Helm](https://helm.sh/). Use the [official
documentation](https://helm.sh/docs/intro/install/) to install Helm.

We'll be using Bitnami's charts for Kafka and MongoDB. Add Bitnami Helm charts
repo.

```
helm repo add bitnami https://charts.bitnami.com/bitnami
```

Create a namespace for `argo`.

```
kubectl --context kind-argo create ns argo
```

Install Kafka.

```
helm --kube-context kind-argo install -n argo --version 12.0.0 kafka bitnami/kafka --set autoCreateTopicsEnable=true
```

Install MongoDB.

```
helm --kube-context kind-argo install -n argo --version 10.0.1 mongodb bitnami/mongodb --set auth.enabled=false --set architecture=replicaset
```

### Interacting with REST API

The following steps require [httpie](https://httpie.io/) command line utility to
be installed.

Use `kubectl port-forward` to setup port forwarding from your kind cluster onto
your localhost.

```
kubectl -n cisco-argome port-forward service/nodemgr 3080:80
```

Create a new node resource.

```
echo '{"spec":{"inbandIP": "192.168.1.105", "name": "node5", "cluster": "/argome.argo.cisco.com/v1/clusters/cluster-1"}}' | http :3080/api/argome.argo.cisco.com/v1/nodes
```

Get the list of nodes to see that the new node is now admitted.

```
http :3080/api/argome.argo.cisco.com/v1/nodes
HTTP/1.1 200 OK
Content-Length: 532
Content-Type: application/json
Date: Fri, 02 Apr 2021 22:42:22 GMT
X-Powered-By: argo.cisco.com
X-Request-Id: c84071f1-3f11-4f43-a77d-bb4c0e98e989

[
    {
        "meta": {
            "annotations": {},
            "deleteTimestamp": "",
            "domain": "",
            "finalizers": {},
            "id": "55c01217-994a-4dd9-9883-5f17c096067f",
            "key": "argome.argo.cisco.com/v1.Node",
            "labels": {},
            "namespace": "",
            "org": "ARGO-FW-TENANT",
            "resourceVersion": 3,
            "specDirty": false,
            "specGenID": 0,
            "status": 3,
            "statusDirty": false,
            "statusGenID": 0
        },
        "spec": {
            "cluster": "cluster-1",
            "inbandIP": "192.168.1.105",
            "name": "node5"
        },
        "status": {
            "cluster": "cluster-1",
            "inbandIP": "192.168.1.105",
            "status": "admitted"
        }
    }
]
```
