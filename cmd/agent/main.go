package main

import (
	"context"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"

	"golang.cisco.com/examples/argome/gen/schema"
	"golang.cisco.com/examples/argome/pkg/handlers"
	"golang.cisco.com/examples/argome/pkg/platform"
)

func onStart(ctx context.Context, changer mo.Changer) error {
	log := core.LoggerFromContext(ctx)

	log.Info("agent service starts")

	return nil
}

func main() {
	handlerReg := []interface{}{
		handlers.AgentHandler,
	}

	var apx service.Service
	var opts service.Options
	opts.PlatformFactory = platform.New
	apx = service.New("agent-manager", schema.Schema(), &opts)
	if apx == nil {
		panic("Could not create the service")
	}
	if err := apx.OnStart(onStart).
		Start(handlerReg...); err != nil {
		panic(err)
	}
}
