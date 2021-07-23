module golang.cisco.com/examples/argome

go 1.15

replace golang.cisco.com/argo => aci-github.cisco.com/pafrank/argo v0.3.1-0.20210723161721-e7edb7a3693a 
replace golang.cisco.com/spartan => aci-github.cisco.com/pafrank/spartan v0.0.0-20210723180317-565dc505d446 
replace golang.cisco.com/argo-galaxies/nexusdashboard => aci-github.cisco.com/atom/argo-galaxies/nexusdashboard v0.9.0
replace golang.cisco.com/argo-galaxies/intersight => aci-github.cisco.com/atom/argo-galaxies/intersight v0.9.0

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
	golang.cisco.com/argo-galaxies/intersight v0.0.0-00010101000000-000000000000
	golang.cisco.com/argo-galaxies/nexusdashboard v0.0.0-00010101000000-000000000000
	golang.cisco.com/spartan v0.0.0-00010101000000-000000000000
)
