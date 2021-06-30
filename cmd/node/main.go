package main

import (
	"context"
	"os"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"

	"golang.cisco.com/spartan/pkg/directory"

	"golang.cisco.com/examples/argome/gen/schema"
	"golang.cisco.com/examples/argome/pkg/handlers"
	"golang.cisco.com/examples/argome/pkg/platform"
)

func onStart(ctx context.Context, changer mo.Changer) error {
	log := core.LoggerFromContext(ctx)

	log.Info("configuring some objects during app start")

	return nil
}

func main() {
	handlerReg := []interface{}{
		handlers.NodeHandler,
		handlers.NodeClusterMemberHandler,
	}

	senv := os.Getenv("SPARTAN_ENV")

	var apx service.Service
	var opts service.Options
	opts.Platform = platform.New
	if senv == "true" {
		opts.Directory = directory.New(schema.Schema())
	}
	apx = service.New("node-manager", schema.Schema(), &opts)
	if apx == nil {
		panic("Could not create the service")
	}
	if err := apx.OnStart(onStart).
		Start(handlerReg...); err != nil {
		panic(err)
	}
}
