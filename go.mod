module golang.cisco.com/examples/argome

go 1.15

replace golang.cisco.com/argo => ./argo

require (
	github.com/go-logr/stdr v0.2.0
	github.com/go-logr/zapr v0.3.0
	github.com/gofrs/uuid v3.3.0+incompatible
	github.com/golangci/golangci-lint v1.33.0 // indirect
	github.com/julienschmidt/httprouter v1.2.0
	github.com/pkg/errors v0.9.1
	github.com/smartystreets/goconvey v1.6.4
	go.uber.org/zap v1.10.0
	golang.cisco.com/argo v0.0.0-00010101000000-000000000000
)
