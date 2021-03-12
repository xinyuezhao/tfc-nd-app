package handlers

import (
	"context"
	"os"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"

	"golang.cisco.com/examples/argome/gen/argomev1"
)

// NodeHandler handler the node object
func NodeHandler(ctx context.Context, event mo.Event) error {
	node := event.Resource().(argomev1.Node)

	log := core.LoggerFromContext(ctx)
	log.Info("handling node", "node", node)

	status := node.StatusMutable()
	status.SetInbandIP(node.Spec().InbandIP())
	status.SetStatus("initialized")

	if node.Spec().ClusterPtr() != nil && node.Spec().Cluster() != "" {
		status.SetCluster(node.Spec().Cluster())
		// get the cluster and set status to adding to cluster
		_, err := event.Store().ResolveByName(ctx, node.Spec().Cluster())
		if err != nil {
			status.SetStatus("admitting")
		}
	}

	if err := event.Store().Record(ctx, node); err != nil {
		return err
	}

	if err := event.Store().Commit(ctx); err != nil {
		panic(err)
	}

	return nil
}

// NodeClusterMemberHandler handles the ClusterNode object
func NodeClusterMemberHandler(ctx context.Context, event mo.Event) error {
	clusterMember := event.Resource().(argomev1.ClusterMember)

	log := core.LoggerFromContext(ctx)
	log.Info("handling ClusterMember", "clusterMember", clusterMember)

	obj, err := event.Store().ResolveByName(ctx, clusterMember.Spec().Name())
	if err != nil {
		// No node object found. Get out
		log.Info("Did not find node object", "name", clusterMember.Spec().Name())
		return nil
	}
	node := obj.(argomev1.Node)

	// Skip for docker runs until docker run migrrates to mongo db
	if val := os.Getenv("ARGO_CONTAINERIZED_RUN"); val != "true" {
		obj, err = event.Store().ResolveByName(ctx, clusterMember.Spec().Cluster())
		if err != nil {
			// cluster object lookup failed
			log.Error(err, "could not resolve the cluster object")
			return nil
		}
		cluster := obj.(argomev1.Cluster)
		log.Info("Found cluster object", "name", cluster.Spec().Name())
	}

	nodeStatus := node.StatusMutable()
	if nodeStatus.Status() != admitted {
		nodeStatus.SetStatus(admitted)
		if err := event.Store().Record(ctx, node); err != nil {
			return err
		}

		if err := event.Store().Commit(ctx); err != nil {
			return err
		}
	}

	return nil
}
