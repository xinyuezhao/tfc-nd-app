module golang.cisco.com/examples/argome

go 1.15

replace golang.cisco.com/argo => aci-github.cisco.com/atom/argo v0.3.1-0.20210325185509-17b9353d29a2 
replace golang.cisco.com/spartan => aci-github.cisco.com/pafrank/spartan v0.0.0-20210324185241-4586bc2ab28d 

require (
	github.com/go-logr/stdr v0.2.0
	github.com/go-logr/zapr v0.4.0
	github.com/gofrs/uuid v3.3.0+incompatible
	github.com/golangci/golangci-lint v1.33.0 // indirect
	github.com/julienschmidt/httprouter v1.3.0
	github.com/pkg/errors v0.9.1
	github.com/smartystreets/goconvey v1.6.4
	go.uber.org/zap v1.13.0
	golang.cisco.com/argo v0.0.0-00010101000000-000000000000
	golang.cisco.com/spartan v0.0.0-00010101000000-000000000000
)
