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
)

func onStart(ctx context.Context, changer mo.Changer) error {
	log := core.LoggerFromContext(ctx)
	log.Info("configuring some objects during app start")
	cluster := argomev1.ClusterFactory()
	cluster.SpecMutable().SetName("cluster-1")
	name, err := utils.AnyMetaName(cluster)
	if err == nil {
		_, err := changer.ResolveByName(ctx, name)
		if err != nil {
			log.Info("creating cluster object")
			cluster.Meta().MutableManagedObjectMetaV1Mo().SetStatus(mo.StatusCreated)
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
	if senv == "true" {
		apx = service.NewWithDirectory("clusterd", schema.Schema(), directory.New(schema.Schema()))
	} else {
		apx = service.New("clusterd", schema.Schema())
	}
	if apx == nil {
		panic("no service was created")
	}
	if err := apx.OnStart(onStart).
		Start(handlerReg...); err != nil {
		panic(err)
	}
}
