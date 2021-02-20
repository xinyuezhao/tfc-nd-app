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
	for nodeIP := range cluster.Nodes() {
		if nodeIP == node {
			return true
		}
	}
	return false
}

// ClusterNodeHandler handles the node object in the cluster service
func ClusterNodeHandler(ctx context.Context, event mo.Event) error {
	log := core.LoggerFromContext(ctx)
	log.Info("handling node", "resource", event.Resource())
	node := event.Resource().(argomev1.Node)
	cluster, err := event.Store().ResolveByName(ctx, node.Cluster())
	if err == nil && !nodeInCluser(cluster.(argomev1.Cluster), node.InbandIP()) {
		nodes := make(map[string]string)
		if cluster.(argomev1.Cluster).NodesPtr() != nil {
			nodes = cluster.(argomev1.Cluster).Nodes()
		}
		nodes[node.InbandIP()] = admitted
		cluster.(argomev1.Cluster).MutableClusterV1Argome().SetNodes(nodes)
		clusterMember := argomev1.ClusterMemberFactory()
		clusterMember.SetName(node.MetaNames()["default"])
		clusterMember.SetCluster(node.Cluster())
		if errx := event.Store().Record(ctx, cluster); errx != nil {
			return errx
		}
		if errx := event.Store().Record(ctx, clusterMember); errx != nil {
			return errx
		}
		if errx := event.Store().Commit(ctx); errx != nil {
			core.LoggerFromContext(ctx).Error(errx, "Failed to commit clustermember")
			return errx
		}
	}
	return err
}
