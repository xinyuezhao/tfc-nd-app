package main

import (
	"context"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"

	"golang.cisco.com/examples/terraform/gen/schema"
	"golang.cisco.com/examples/terraform/pkg/handlers"
	"golang.cisco.com/examples/terraform/pkg/platform"
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
		handlers.TaskHandler,
	}

	var apx service.Service
	var opts service.Options
	opts.PlatformFactory = platform.New
	apx = service.New("node-manager", schema.Schema(), &opts)
	if apx == nil {
		panic("Could not create the service")
	}
	if err := apx.OnStart(onStart).
		Start(handlerReg...); err != nil {
		panic(err)
	}
}
