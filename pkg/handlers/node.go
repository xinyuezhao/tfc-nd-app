package handlers

import (
	"context"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/utils"

	"golang.cisco.com/examples/argome/gen/argomev1"
)

// NodeHandler handler the node object
func NodeHandler(ctx context.Context, event mo.Event) error {
	log := core.LoggerFromContext(ctx)
	log.Info("handling node", "resource", event.Resource())
	node := event.Resource().(argomev1.Node)
	oper := argomev1.NodeOperFactory()
	oper.SetInbandIP(node.InbandIP())
	oper.SetStatus("initialized")
	oper.Meta().MutableManagedObjectMetaV1Mo().SetStatus(mo.StatusCreated)

	if node.ClusterPtr() != nil && node.Cluster() != "" {
		oper.SetCluster(node.Cluster())
		// get the cluster and set status to adding to cluster
		_, err := event.Store().ResolveByName(ctx, node.Cluster())
		if err != nil {
			oper.SetStatus("admitting")
		}
	}
	if err := event.Store().Record(ctx, oper); err != nil {
		return err
	}
	operName, err := utils.AnyMetaName(oper)
	if err != nil {
		panic(err)
	}
	node.MutableNodeV1Argome().SetOper(operName)
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
	log := core.LoggerFromContext(ctx)
	log.Info("handling clustermember", "resource", event.Resource())
	clusterMember := event.Resource().(argomev1.ClusterMember)
	obj, err := event.Store().ResolveByName(ctx, clusterMember.Name())
	if err != nil {
		// No node object found. Get out
		log.Info("Did not find node object", "name", clusterMember.Name())
		return nil
	}
	node := obj.(argomev1.Node)
	obj, err = event.Store().ResolveByName(ctx, node.Oper())
	if err != nil {
		// No node oper object found. Get out
		log.Info("Did not find node oper object", "name", node.Oper())
		return err
	}
	nodeOper := obj.(argomev1.NodeOper)
	if nodeOper.Status() != admitted {
		nodeOper.MutableNodeOperV1Argome().SetStatus(admitted)
		if err := event.Store().Record(ctx, nodeOper); err != nil {
			return err
		}
		if err := event.Store().Commit(ctx); err != nil {
			return err
		}
	}
	return nil
}
