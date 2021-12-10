package handlers

import (
	"context"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/lockable"
	"golang.cisco.com/argo/pkg/mo"

	"golang.cisco.com/examples/terraform/gen/terraformv1"
)

const (
	ttl             = 60
	refreshInterval = 10
)

// TaskHandler handles the lifecycle of a background task. The
// stateful handler is sticky and also periodically polls and
// updates current admitted nodes.
func TaskHandler(ctx context.Context, event mo.Event) error {
	core.LoggerFromContext(ctx).Info("Task posted")
	// Custom fetcher for nodes
	TaskFetcher := func(r mo.Resolver) (string, []mo.Object, error) {
		obj, err := r.ResolveByID(ctx, event.Resource().Meta().ID())
		if err != nil {
			core.LoggerFromContext(ctx).Error(err, "Task not found")
			return "", nil, err
		}

		return obj.Meta().Key(), []mo.Object{obj}, nil
	}

	nodesFetcher := func(r mo.Resolver) (string, []mo.Object, error) {
		core.LoggerFromContext(ctx).Info("finding all nodes")
		objs := r.ResolveByKind(ctx, terraformv1.NodeMeta().MetaKey())
		if len(objs) > 0 {
			return terraformv1.NodeMeta().MetaKey(), objs, nil
		}

		return "", nil, nil
	}

	var handler = func(ctx context.Context, le lockable.Event) error {
		logger := core.LoggerFromContext(ctx)
		for {
			select {
			case <-ctx.Done():
				core.LoggerFromContext(ctx).Info("exiting handler")
				return nil
			case event := <-le.UpdateChannel():
				core.LoggerFromContext(ctx).Info("received event", "kind", event.Key)
				switch event.Key {
				case le.Resource().Meta().Key():
					Task := event.Objects[0]
					logger.Info(
						"periodic Task update",
						"resourceVersion",
						Task.Meta().ResourceVersion(),
					)
				case terraformv1.NodeMeta().MetaKey():
					objs := event.Objects
					nodes := make([]terraformv1.NodeStatus, 0)
					for _, o := range objs {
						nodes = append(nodes, o.(terraformv1.Node).Status())
					}

					Task, err := le.Store().ResolveByID(ctx, le.Resource().Meta().ID())
					if err != nil {
						logger.Error(err, "failed to lookup locked resource")
					}

					if err = Task.(terraformv1.TaskMutable).StatusMutable().SetNodeList(nodes); err != nil {
						logger.Error(err, "failed to set status")
					}
					if err = Task.(terraformv1.TaskMutable).StatusMutable().SetStatus(true); err != nil {
						logger.Error(err, "failed to set status")
					}

					logger.Info(
						"Updated node status in Task",
						"count",
						len(objs),
					)

					if err := le.Store().Record(ctx, Task); err != nil {
						logger.Error(err, "record failed")
					}

					if err := le.Store().Commit(ctx); err != nil {
						logger.Error(err, "commit failed")
					}

					logger.Info("nodes updated")
				}
			}
		}
	}

	// start a background task. Ideally should only be done on CREATE event, but in the absence of
	// reconciliation feature, will just try to create a task on every update.
	if err := lockable.LockAndExec(ctx, event.Resource(), handler,
		lockable.WithTTL(ttl), lockable.WithRenewalInterval(refreshInterval),
		lockable.WithFetcher(TaskFetcher), lockable.WithFetcher(nodesFetcher),
	); err != nil {
		core.LoggerFromContext(ctx).Error(err, "failed to create background task")
	}

	return nil
}
