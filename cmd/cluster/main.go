package main

import (
	"context"
	"os"

	"golang.cisco.com/examples/argome/gen/argomev1"

	"golang.cisco.com/spartan/pkg/directory"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"
	"golang.cisco.com/argo/pkg/utils"

	"golang.cisco.com/examples/argome/gen/schema"
	"golang.cisco.com/examples/argome/pkg/handlers"
	"golang.cisco.com/examples/argome/pkg/platform"
)

func onStart(ctx context.Context, changer mo.Changer) error {
	log := core.LoggerFromContext(ctx)
	log.Info("configuring some objects during app start")
	cluster := argomev1.ClusterFactory()
	if err := cluster.SpecMutable().SetName("cluster-1"); err != nil {
		return err
	}
	name, err := utils.AnyMetaName(cluster)
	if err == nil {
		_, err := changer.ResolveByName(ctx, name)
		if err != nil {
			log.Info("creating cluster object")
			if errx := cluster.Meta().MutableManagedObjectMetaV1Argo().SetStatus(mo.StatusCreated); errx != nil {
				return errx
			}
			return mo.ChangerFromContext(ctx).Apply(ctx, cluster)
		}
	}
	return nil
}

func main() {
	handlerReg := []interface{}{
		handlers.ClusterHandler,
		handlers.ClusterNodeHandler,
	}

	senv := os.Getenv("SPARTAN_ENV")

	var apx service.Service
	var opts service.Options
	opts.PlatformFactory = platform.New
	if senv == "true" {
		opts.Directory = directory.New(schema.Schema())
	}
	apx = service.New("clusterd", schema.Schema(), &opts)
	if apx == nil {
		panic("no service was created")
	}
	if err := apx.OnStart(onStart).
		Start(handlerReg...); err != nil {
		panic(err)
	}
}
