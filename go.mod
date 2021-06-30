module golang.cisco.com/examples/argome

go 1.15

replace golang.cisco.com/argo => aci-github.cisco.com/pafrank/argo v0.3.1-0.20210630013916-0d3389f642a5

replace golang.cisco.com/argogalaxies/nexusdashboard => aci-github.cisco.com/pafrank/argogalaxies/nexusdashboard v0.0.0-20210630050906-59735e8ddbc2 

replace golang.cisco.com/spartan => aci-github.cisco.com/atom/spartan v0.0.0-20210420001520-45fd84d8759b

require (
	github.com/go-logr/stdr v0.2.0
	github.com/go-logr/zapr v0.4.0
	github.com/gofrs/uuid v3.3.0+incompatible
	github.com/golangci/golangci-lint v1.33.0 // indirect
	github.com/julienschmidt/httprouter v1.3.0
	github.com/pkg/errors v0.9.1
	github.com/smartystreets/goconvey v1.6.4
	go.uber.org/zap v1.18.1
	golang.cisco.com/argo v0.0.0-00010101000000-000000000000
	golang.cisco.com/argogalaxies/nexusdashboard v0.0.0-00010101000000-000000000000
	golang.cisco.com/spartan v0.0.0-00010101000000-000000000000
)
