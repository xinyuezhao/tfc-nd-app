package handlers

import (
	"context"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/model"

	"golang.cisco.com/examples/terraform/gen/terraformv1"
)

// NodeHandler handler the node object
func NodeHandler(ctx context.Context, event mo.Event) error {
	node := event.Resource().(terraformv1.Node)

	log := core.LoggerFromContext(ctx)
	log.Info("handling node resource", "node", node)
	changed := false
	status := node.StatusMutable()
	if status.InbandIP() != node.Spec().InbandIP() {
		if err := core.NewError(status.SetInbandIP(node.Spec().InbandIP())); err != nil {
			return err
		}
		changed = true
	}

	if node.Spec().ClusterPtr() != nil {
		// get the cluster and set status to adding to cluster
		clusterKey := terraformv1.ClusterDNForDefault(node.Spec().Cluster())
		if node.Spec().Cluster() == "" {
			clusterKey = ""
		}
		if status.Cluster() != clusterKey {
			if err := status.SetCluster(clusterKey); err != nil {
				return err
			}
			// get the cluster and set status to adding to cluster
			_, err := event.Store().ResolveByName(ctx, clusterKey)
			if err == nil {
				if errx := status.SetStatus("admitting"); errx != nil {
					return errx
				}
			} else {
				if errx := status.SetStatus("initialized"); errx != nil {
					return errx
				}
			}
			changed = true
		}
	}

	if changed {
		if err := event.Store().Record(ctx, node); err != nil {
			return err
		}

		if err := event.Store().Commit(ctx); err != nil {
			return err
		}
	}

	return nil
}

// NodeClusterMemberHandler handles the ClusterNode object
func NodeClusterMemberHandler(ctx context.Context, event mo.Event) error {
	clusterMember := event.Resource().(terraformv1.ClusterMember)

	log := core.LoggerFromContext(ctx)
	log.Info("handling ClusterMember", "clusterMember", clusterMember)

	obj, err := event.Store().ResolveByName(ctx, clusterMember.Spec().Name())
	if err != nil {
		// No node object found. Get out
		log.Info("Did not find node object", "name", clusterMember.Spec().Name())
		return nil
	}
	node := obj.(terraformv1.Node)

	// Check if you can read the other services DB
	obj, err = event.Store().ResolveByName(ctx, clusterMember.Spec().Cluster())
	if err != nil {
		// cluster object lookup failed
		log.Error(err, "could not resolve the cluster object")
		return nil
	}
	cluster := obj.(terraformv1.Cluster)
	log.Info("Found cluster object", "name", cluster.Spec().Name())

	if event.Operation() == model.DELETE {
		log.Info("Clustermember deleted", "name", clusterMember.Spec().Name())
	} else {
		nodeStatus := node.StatusMutable()
		if nodeStatus.Status() != admitted {
			if err := nodeStatus.SetStatus(admitted); err != nil {
				return err
			}
			if err := event.Store().Record(ctx, node); err != nil {
				return err
			}

			if err := event.Store().Commit(ctx); err != nil {
				return err
			}
		}
	}

	return nil
}
