package main

import (
	"context"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"

	v1 "golang.cisco.com/examples/argome/gen/argomev1"
	"golang.cisco.com/examples/argome/gen/schema"
	"golang.cisco.com/examples/argome/pkg/handlers"
	"golang.cisco.com/examples/argome/pkg/platform"
)

func onStart(ctx context.Context, changer mo.Changer) error {
	log := core.LoggerFromContext(ctx)

	helloWorld := v1.WorldFactory()
	if err := helloWorld.SpecMutable().SetName("hello"); err != nil {
		return err
	}

	log.Info("configuring some objects during app start",
		"metaNames", helloWorld.MetaNames(),
		"object", helloWorld)

	return changer.Apply(ctx, helloWorld)
}

func main() {
	handlerReg := []interface{}{
		handlers.WorldHandler,
	}

	var apx service.Service
	var opts service.Options
	opts.PlatformFactory = platform.New
	apx = service.New("world-manager", schema.Schema(), &opts)
	if apx == nil {
		panic("Could not create the service")
	}
	if err := apx.OnStart(onStart).
		Start(handlerReg...); err != nil {
		panic(err)
	}
}
