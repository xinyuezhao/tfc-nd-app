## Steps to add a new ND service

### Create a new directory under "cmd" for the new service

ex: cmd/inventory

### Add basic files that creates the ARGO app and initializes it

* Use the examples in cmd/nodemgr/main.go as a guide
* Copy the logger file "log.go" from cmd/nodemgr if you want to use the zapr logger else use stdr logger and skip the log.go file

### Edit the top level makefile to build the service. Add a new target for the service and add the target to the list of services to be built

```
diff --git a/Makefile b/Makefile
index 8151618..e510113 100644
--- a/Makefile
+++ b/Makefile
@@ -77,10 +77,13 @@ clusterd: argo
 node: argo
        go build ./cmd/node

+inventory: argo
+       go build ./cmd/inventory
+

-services: clusterd node
+services: clusterd node inventory


```

### Add the service to the app definition for ND

```
diff --git a/deployment/nd/meta/ClusterMgrConfig/k8s-specs/on-install/app.yml b/deployment/nd/meta/ClusterMgrConfig/k8s-specs/on-install/app.yml
index ca88447..07dfd7e 100644
--- a/deployment/nd/meta/ClusterMgrConfig/k8s-specs/on-install/app.yml
+++ b/deployment/nd/meta/ClusterMgrConfig/k8s-specs/on-install/app.yml
@@ -172,3 +172,11 @@ spec:
     authType: open
     listenPaths:
     - path: "/sedgeapi/v1/cisco-argome/clustermgr"
+  - target: inventory
+    service:
+      scheme: http
+      name: inventory
+      port: 80
+    authType: open
+    listenPaths:
+    - path: "/sedgeapi/v1/cisco-argome/inventory"
```

### Create a new deployment and service specification for the new service.

* Use the following file as your guide. 
deployment/nd/meta/ClusterMgrConfig/k8s-specs/on-enable/nodemgr.yml

* Duplicate the file and edit it to reflect the correct service and deployment names

### Add the service to the docker images to be built in the top level makefile

```
@@ -91,6 +94,10 @@ docker-images:
        cp cmd/cluster/config.json deployment/docker/clustermgr
        docker build --tag clustermgr:v1 deployment/docker/clustermgr

-       docker save nodemgr:v1 clustermgr:v1 | gzip > images.tar.gz
+       cp fabric deployment/docker/inventory
+       cp cmd/fabric/config.json deployment/docker/inventory
+       docker build --tag inventory:v1 deployment/docker/inventory
+
+       docker save nodemgr:v1 clustermgr:v1 inventory:v1 | gzip > images.tar.gz

```

### Run the build
```
./build-nd.sh
```

The resulting ".aci" file will contain your new service as part of the "argome" application deployment

