package handlers

import (
	"context"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"

	"golang.cisco.com/examples/terraform/gen/terraformv1"
)

const (
	admitted = "admitted"
)

// ClusterHandler handles the cluster object
func ClusterHandler(ctx context.Context, event mo.Event) error {
	log := core.LoggerFromContext(ctx)
	log.Info("handling cluster", "resource", event.Resource().MetaNames())
	_ = event.Resource().(terraformv1.Cluster)

	return nil
}

func nodeInCluster(cluster terraformv1.Cluster, node string) bool {
	for nodeIP := range cluster.Status().Nodes() {
		if nodeIP == node {
			return true
		}
	}
	return false
}

// ClusterNodeHandler handles the node object in the cluster service
func ClusterNodeHandler(ctx context.Context, event mo.Event) error {
	node := event.Resource().(terraformv1.Node)

	log := core.LoggerFromContext(ctx)
	log.Info("handling node", "node", node)

	clusterKey := terraformv1.ClusterDNForDefault(node.Spec().Cluster())
	obj, err := event.Store().ResolveByName(ctx, clusterKey)
	if err != nil {
		return nil
	}

	cluster := obj.(terraformv1.Cluster)
	if nodeInCluster(cluster, node.Spec().InbandIP()) {
		return nil
	}

	if err := cluster.StatusMutable().SetNodesEl(node.Spec().InbandIP(), "admitted"); err != nil {
		return err
	}

	clusterMember := terraformv1.ClusterMemberFactory()
	if err := core.NewError(clusterMember.SpecMutable().SetName(node.MetaNames()["default"]),
		clusterMember.SpecMutable().SetCluster(clusterKey)); err != nil {
		return err
	}
	cmDN := terraformv1.ClusterMemberDNForDefault(node.MetaNames()["default"])
	if cm, err := event.Store().ResolveByName(ctx, cmDN); err == nil {
		if cm.(terraformv1.ClusterMember).Spec().Cluster() != node.Status().Cluster() {
			if err := cm.Meta().MutableManagedObjectMetaV1Argo().SetStatus(mo.StatusDeleted); err != nil {
				return err
			}
			if err := event.Store().Record(ctx, cm); err != nil {
				return err
			}
		}
	}

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
