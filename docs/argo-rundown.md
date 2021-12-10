---
title: Argo Presentatioin
paginate: true
marp: true
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Objectives
- Framework for SaaS applications
- Ability to Deploy In Cloud and On Prem
- Feature Velocity
- Horizontally Scalable
- Reduced Boilerplate
- Unified Development Experience
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Argo Overview: Philosophy
- Model Driven
- Intent Based
- Reactive (via EventHandlers)
- Level Triggered: Handlers react to current state
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Argo Overview: Core Features
- Platform-agnostic
- Polyglot
- Multi-tenancy, Integrated RBAC
- Spec/Status Separation
- Scopes, Resources, Structs, Handlers
- REST APIs
- "Views"
- Canary Upgrade
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Application Development and Deployment Cycle
- Data Model
- Object Relationships (via Selectors)
- Handlers
- Deployment Descriptors
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Modeling Language
- Model is The Source Of Truth
- Rest APIs, with Field-Level Control per API
- Views, Actions are implemented as Resources
- OpenAPI Spec
- API Groups and API Versioning
- Primary Key, Identity Rules
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Example: Scope Definition
```
---
kind: Scope
metadata:
  name: base
---
kind: Scope
metadata:
  name: gocommon
  extends:
    - base
spec:
  external-packages:
    - alias: mo
      target-import: golang.cisco.com/argo/pkg/mo
  type-mappings:
    - ddr-type: time
      target-type: time.Time
      alias: time
      target-import: time
    - ddr-type: uuid
      target-type: uuid.UUID
      alias: uuid
      target-import: github.com/gofrs/uuid
      url-marshaller: uuidToString
      url-unmarshaller: stringToUUID
    - ddr-type: Version
      target-type: int8
    - ddr-type: Status
      target-type: int8
    - ddr-type: labelSelector
      target-type: mo.LabelSelectorDef
      alias: mo
    - ddr-type: fieldSelector
      target-type: mo.FieldSelectorDef
      alias: mo
      target-import: golang.cisco.com/argo/pkg/mo
    - ddr-type: selectorStatus
      target-type: mo.SelectorStatus
      alias: mo
      target-import: golang.cisco.com/argo/pkg/mo
```
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Example: Resource Definition
```
---
kind: Resource
metadata:
  name: Node
  group: terraform.argo.cisco.com
  version: v1
spec:
  spec:
    type: v1.NodeSpec
  status:
    type: v1.NodeStatus
  pkey: spec.inbandIP
  apimethods:
    - apimethod: GET
    - apimethod: PUT
    - apimethod: POST
    - apimethod: DELETE
---
kind: Struct
metadata:
  name: NodeSpec
  group: terraform.argo.cisco.com
  version: v1
spec:
  props:
    - prop: inbandIP
      type: string
    - prop: cluster
      type: string
    - prop: name
      type: string
---
kind: Struct
metadata:
  name: NodeStatus
  group: terraform.argo.cisco.com
  version: v1
spec:
  props:
    - prop: inbandIP
      type: string
    - prop: status
      type: string
    - prop: cluster
      type: string
```
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Example: Identity Rules
```
kind: Resource
metadata:
  name: StaticRoute
  group: npb.argo.cisco.com
  version: v1
spec:
  identity-rules:
    - identity-rule: vrfDip
      scope: org
      prop-refs:
        - prop-ref: spec.networkInstanceName
          alias: network-instance
        - prop-ref: spec.prefix.cidr4
          alias: prefix
  spec:
    type: v1.Ipv4RouteEntrySpec
  status:
    type: v1.Ipv4RouteEntryStatus
  apimethods:
    - apimethod: GET
    - apimethod: POST
    - apimethod: DELETE
---
kind: Struct
metadata:
  name: Ipv4RouteEntrySpec
  group: npb.argo.cisco.com
  version: v1
spec:
  props:
    - prop: networkInstanceName
      type: string
    - prop: prefix
      type: v1.Ip4Addr
    - prop: nextHops
      type: []v1.Ipv4RouteEntryNextHop
    - prop: routeType
      type: v1.RouteType
      default: Staticv4
    - prop: enabled
      type: v1.Enabled
```
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Relationships (via Selectors)
- Relationships are implemented as Selectors
- A Selector is defined on a Resource. The Resource on which it's defined is a "Source"
- A Selector specifies the type of a Resource on the other side of the Relationship. The type may be any defined in the model. Multiple selectors may target multiple types
- Selector specifies a condition which includes an instance of target type into the ResultSet
- The condition is settable by the user or by the app
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Example: Selectors
```
apiVersion: plastic.aci.cisco.com/v1
kind: Resource
metadata:
  name: Book
  group: book.aci.cisco.com
  version: v1
  namespaced: true
spec:
  apimethods:
    - apimethod: GET
    - apimethod: POST
    - apimethod: PUT
    - apimethod: DELETE
  pkey: spec.name
  spec:
    field-selectors:
      - field-selector: publisher
        type: v1.Publisher
    type: v1.BookSpec
---
apiVersion: argo.cisco.com/v1
kind: Resource
metadata:
  name: Publisher
  group: book.aci.cisco.com
  version: v1
  namespaced: true
spec:
  apimethods:
    - apimethod: GET
    - apimethod: POST
    - apimethod: PUT
    - apimethod: DELETE
  spec:
    type: v1.PublisherSpec
---
kind: Struct
metadata:
  name: PublisherSpec
  group: book.aci.cisco.com
  version: v1
  extends:
    - fridgeapp.aci.cisco.com/v1.PersonSpec
spec:
  props:
    - prop: favPet
      type: v1.Pet
---
kind: Struct
metadata:
  name: Pet
  group: fridgeapp.aci.cisco.com
  version: v1
spec:
  props:
    - prop: name
      type: string
    - prop: type
      type: string
    - prop: breed
      type: string
    - prop: age
      type: int
```
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Handlers
- Application business logic to be triggered in various runtime scenarios 
- Handlers modeled by developer and registered by framework
- Framework invoked handler based on the encountered scenario
- Handler code is written as a reaction to data mutation or time elapsed
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Example: Handler
```
kind: ResourceHandler
metadata:
  name: NodeHandler
spec:
  resource: terraform.argo.cisco.com/v1.Node
  operations:
    - CREATE
    - UPDATE
  retryStrategy:
    delay: 500
  concurrencyKey: node
  function: golang.cisco.com/examples/terraform/pkg/handlers.NodeHandler
```
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Work Engine
![h:550](https://aci-github.cisco.com/storage/user/35/files/456e2280-2cf8-11ec-96fd-a5ae1f00f95e)
-
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Reconciliation
* Applications are written as a control loop between intent and current state
* Application Handler execution is based on notifications generated by framework 
* Notifications carry latest state (not diffs) and handlers run to process latest state
> * Level triggered system
> * Handlers should be idempotent
> * Notifications can be lost or deduped
> * Latest state will be notified 
* Reconciliation - periodic notification of current state
* Reconciliation handlers can catch up to latest state of the system
* Forced reconciliation to recover a diverged system
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Spartan
![h:550](https://aci-github.cisco.com/storage/user/35/files/cecb2800-2ceb-11ec-9958-566a1d4ef205)
-
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Database
- MongoDB chosen as the database infra after comparing it with other DBs like SQLite, Postgres, CockroachDB
- Highly scalable distributed document database with replication and consistency concerns built in, amazing indexing and query capabilities
- Strong community support and major adoption within Cisco as well, like Intersight
- **Schema-less architecture** which means minimal to no data conversion needed during upgrades
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Database (cont-d)
- **Shared DB** which means any app from any node can  access data (with RBAC). Separates data ownership from data processing paving path for serverless/lambda architecture
- Use core DB features like Query, filtering, Aggregation, Pagination etc instead of building (sub-optimal) layer on top
- Data stored in JSON format, which means more easily human consumable for debugging
- Exploring other features like Kafka-connectors, Change streams, time-series support etc
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Horizontal Scaling
- Goal is for each service within an app to be scaled individually
- **Dynamic scaling**: Services would be able to scale up or down dynamically without any code level changes. Allows devops to handle scale based on load
- **Stateless handlers**: All handlers are stateless owing to shared DB approach and hence can be scaled linearly
- **Consumer groups**: As instances are scaled up or down, kafka partitions are rebalanced gauranteeing that only one instance handles a partition
- **Shards vs Partitions**: Model owner defines rules for sharding and grouping resources into buckets like Tenants. Devops defines number of (kafka) partition to scale handlers
---

![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Upgrade, Canary Upgrade
- Customer, not software, as a unit of upgrade
- New versions are rolled out per service to latest realm
- Two realms, ga and latest
- Policy to assign a customer to a realm
- Matured versions are rolled out to ga realm
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Roadmap
- Metrics and Tracing
- Audit Logs
- HTTP Watch
- Go Client Bindings
- CLI Tool
- "Optional" types
- Selector Constraints (containment, etc.)
- Selector Label Propagation
---
![bg](https://cdn.pixabay.com/photo/2021/02/22/19/47/backdrop-6041422_960_720.jpg)
# Current Projects
- **CAPIC**
- **GCS**
- **CloudFabric**
- **NDB**
- **NDO**

