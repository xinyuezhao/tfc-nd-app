package handlers

import (
	"context"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"

	"golang.cisco.com/examples/argome/gen/argomev1"
)

const (
	admitted = "admitted"
)

// ClusterHandler handles the cluster object
func ClusterHandler(ctx context.Context, event mo.Event) error {
	log := core.LoggerFromContext(ctx)
	log.Info("handling cluster", "resource", event.Resource().MetaNames())
	_ = event.Resource().(argomev1.Cluster)

	return nil
}

func nodeInCluser(cluster argomev1.Cluster, node string) bool {
	for nodeIP := range cluster.Status().Nodes() {
		if nodeIP == node {
			return true
		}
	}
	return false
}

// ClusterNodeHandler handles the node object in the cluster service
func ClusterNodeHandler(ctx context.Context, event mo.Event) error {
	node := event.Resource().(argomev1.Node)

	log := core.LoggerFromContext(ctx)
	log.Info("handling node", "node", node)

	obj, err := event.Store().ResolveByName(ctx, node.Spec().Cluster())
	if err != nil {
		return err
	}

	cluster := obj.(argomev1.Cluster)
	if nodeInCluser(cluster, node.Spec().InbandIP()) {
		return nil
	}

	cluster.StatusMutable().SetNodesEl(node.Spec().InbandIP(), "admitted")

	clusterMember := argomev1.ClusterMemberFactory()
	clusterMember.SpecMutable().SetName(node.MetaNames()["default"])
	clusterMember.SpecMutable().SetCluster(node.Spec().Cluster())

	if err := event.Store().Record(ctx, cluster); err != nil {
		return err
	}

	if err := event.Store().Record(ctx, clusterMember); err != nil {
		return err
	}

	if err := event.Store().Commit(ctx); err != nil {
		core.LoggerFromContext(ctx).Error(err, "failed to commit ClusterMember")
		return err
	}

	return nil
}
