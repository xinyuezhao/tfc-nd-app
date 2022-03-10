package handlers

import (
	"context"
	"fmt"
	"time"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/model"
	"golang.cisco.com/terraform/gen/terraformv1"
	"golang.cisco.com/terraform/pkg/conf"
)

func AgentHandler(ctx context.Context, event mo.Event) error {
	log := core.LoggerFromContext(ctx)
	log.Info("handling Agent", "resource", event.Resource())
	agent := event.Resource().(terraformv1.Agent)
	name := agent.Spec().Name()
	if event.Operation() == model.CREATE {
		agent, err := conf.StartAgent(ctx, false, agent)
		if err != nil {
			errStartAgent := fmt.Errorf("error from StartAgent while starting an agent")
			return core.NewError(err, errStartAgent)
		}
		if err := event.Store().Record(ctx, agent); err != nil {
			core.LoggerFromContext(ctx).Error(err, "failed to record Agent")
			return err
		}
		if err := event.Store().Commit(ctx); err != nil {
			core.LoggerFromContext(ctx).Error(err, "failed to commit Agent")
			return err
		}
	}

	if event.Operation() == model.DELETE {
		tokenID := agent.Spec().TokenId()
		// delete feature instance to stop the agent
		tlsClient := conf.ConfigTLSClient()
		log.Info("before delete agent feature instance")
		err := conf.DelFeatureInstance(ctx, tlsClient, name)
		if err != nil {
			er := fmt.Errorf("error from DelFeatureInstance")
			return core.NewError(er, err)
		}
		log.Info("after deleting feature instance")
		log.Info("remove agentToken")
		time.Sleep(10 * time.Second)
		if tokenID != "" {
			ctxTfe, client, err := conf.ConfigTFC()
			if err != nil {
				er := fmt.Errorf("error from ConfigTFC while deleting agent")
				return core.NewError(er, err)
			}
			removeErr := conf.RemoveAgentToken(ctxTfe, client, tokenID)
			if removeErr != nil {
				er := fmt.Errorf("error from RemoveAgentToken")
				return core.NewError(er, removeErr)
			}
		}
		log.Info("after removing agentToken")
	}
	return nil
}

func AgentValidator(ctx context.Context, event mo.Validation) error {
	log := core.LoggerFromContext(ctx)
	// TODO:event.Operation() description requied only if agent without token
	log.Info("validate Agent", "resource", event.Resource())
	agent := event.Resource().(terraformv1.Agent)
	desc := agent.Spec().Description()
	name := agent.Spec().Name()
	empty := ""
	if name == "" {
		empty = "name"
	} else if desc == "" {
		empty = "description"
	}
	if empty != "" {
		err := core.NewError(fmt.Errorf("agent %s can't be blank", empty))
		return err
	}
	return nil
}
