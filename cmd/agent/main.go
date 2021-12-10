package main

import (
	"context"
	"fmt"
	"net/http"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"

	"golang.cisco.com/examples/terraform/gen/schema"
	"golang.cisco.com/examples/terraform/gen/terraformv1"
	"golang.cisco.com/examples/terraform/pkg/conf"
	"golang.cisco.com/examples/terraform/pkg/handlers"
	"golang.cisco.com/examples/terraform/pkg/platform"
)

func GETOverride(ctx context.Context, event *terraformv1.TokenListDbReadEvent) (terraformv1.TokenList, int, error) {
	payloadObject := event.Resource().(terraformv1.TokenList)
	agentPlId := payloadObject.Spec().Agentpool()
	ctxTfe, client, err := conf.ConfigTFC()
	if err != nil {
		er := fmt.Errorf("error from configTFC")
		return nil, http.StatusInternalServerError, core.NewError(err, er)
	}
	tokens, err := conf.QueryAgentTokens(ctxTfe, client, agentPlId)
	if err != nil {
		er := fmt.Errorf("error from QueryAgentTokens")
		return nil, http.StatusInternalServerError, core.NewError(err, er)
	}
	result := terraformv1.TokenListFactory()
	errs := make([]error, 0)
	for _, token := range tokens {
		errs = append(errs, result.SpecMutable().TokensAppendEl(token.ID))
	}
	errs = append(errs, result.SpecMutable().SetAgentpool(agentPlId))
	if err := core.NewError(errs...); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return result, http.StatusOK, nil
}

func GETAgentOverride(ctx context.Context, event *terraformv1.AgentDbReadEvent) (terraformv1.Agent, int, error) {
	log := core.LoggerFromContext(ctx)
	name := event.Resource().(terraformv1.Agent).Spec().Name()
	obj, err := event.Store().ResolveByName(ctx, terraformv1.AgentDNForDefault(name))
	if err != nil {
		er := fmt.Errorf("error from resolveByName()")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	payloadObject := obj.(terraformv1.Agent)
	if err := core.NewError(payloadObject.SpecMutable().SetToken("********")); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	TLSclient := conf.ConfigTLSClient()
	// call feature api to get feature instance status
	// whether query feature instance operstate right after it was created?
	features, err := conf.QueryFeatures(ctx, TLSclient)
	if err != nil {
		er := fmt.Errorf("error from queryFeatures")
		return nil, http.StatusInternalServerError, core.NewError(err, er)
	}
	for _, feature := range features.Instances[0].Features {
		if feature.Instance == name {
			payloadObject.SpecMutable().SetStatus(feature.OperState)
		}
	}
	// get agentPoolId != "" when agentToken was created automatically
	agentPlId := payloadObject.Spec().AgentpoolId()
	if agentPlId != "" {
		_, TFEclient, err := conf.ConfigTFC()
		if err != nil {
			er := fmt.Errorf("error from configTFC")
			return nil, http.StatusInternalServerError, core.NewError(err, er)
		}
		// get agentId by agentPoolId & agentName when agentToken was created automatically
		agents, err := conf.QueryAgents(ctx, TLSclient, TFEclient, agentPlId)
		if err != nil {
			er := fmt.Errorf("error from queryAgents")
			return nil, http.StatusInternalServerError, core.NewError(er, err)
		}
		agentId := conf.QueryAgentId(ctx, agents, name)

		// query status
		status := payloadObject.Spec().Status()
		if status == "Running" {
			if agentId != "" {
				log.Info("id used to query status " + agentId)
				status, err := conf.QueryAgentStatus(ctx, agentId)
				if err != nil {
					er := fmt.Errorf("error from queryAgentStatus")
					return nil, http.StatusInternalServerError, core.NewError(er, err)
				}
				if err := core.NewError(payloadObject.SpecMutable().SetStatus(status)); err != nil {
					return nil, http.StatusInternalServerError, err
				}
			}
		}
	}
	return payloadObject, http.StatusOK, nil
}

func ListOverride(ctx context.Context, event *mo.TypeHandlerEvent) ([]terraformv1.Agent, int, error) {
	log := core.LoggerFromContext(ctx)
	objs := event.Resolver.ResolveByKind(ctx, terraformv1.AgentMeta().MetaKey())
	result := make([]terraformv1.Agent, 0)
	TLSclient := conf.ConfigTLSClient()
	features, err := conf.QueryFeatures(ctx, TLSclient)
	if err != nil {
		er := fmt.Errorf("error during querying features")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	for _, obj := range objs {
		payloadObject := obj.(terraformv1.Agent)
		if err := core.NewError(payloadObject.SpecMutable().SetToken("********")); err != nil {
			er := fmt.Errorf("error during set token")
			return nil, http.StatusInternalServerError, core.NewError(er, err)
		}
		name := payloadObject.Spec().Name()
		for _, feature := range features.Instances[0].Features {
			if feature.Instance == name {
				payloadObject.SpecMutable().SetStatus(feature.OperState)
			}
		}
		// get agentPoolId
		agentPlId := payloadObject.Spec().AgentpoolId()
		// query agent status only when agentToken was created by backend
		if agentPlId != "" {
			_, TFEclient, err := conf.ConfigTFC()
			if err != nil {
				er := fmt.Errorf("error during config TFC")
				return nil, http.StatusInternalServerError, core.NewError(er, err)
			}
			// get agentId by agentPoolId & agentName
			agents, err := conf.QueryAgents(ctx, TLSclient, TFEclient, agentPlId)
			if err != nil {
				er := fmt.Errorf("error during querying agents")
				return nil, http.StatusInternalServerError, core.NewError(er, err)
			}

			agentId := conf.QueryAgentId(ctx, agents, name)

			status := payloadObject.Spec().Status()
			log.Info("status before query status by id " + status)
			if status == "Running" {
				if agentId != "" {
					log.Info("query agents' status " + agentId)
					status, err := conf.QueryAgentStatus(ctx, agentId)
					if err != nil {
						er := fmt.Errorf("error during querying agent status")
						return nil, http.StatusInternalServerError, core.NewError(er, err)
					}
					if err := core.NewError(payloadObject.SpecMutable().SetStatus(status)); err != nil {
						er := fmt.Errorf("error during set status")
						return nil, http.StatusInternalServerError, core.NewError(er, err)
					}
				}
			}
		}
		result = append(result, payloadObject)
	}
	return result, http.StatusOK, nil
}

func onStart(ctx context.Context, changer mo.Changer) error {
	log := core.LoggerFromContext(ctx)

	log.Info("agent service starts")

	return nil
}

func main() {
	handlerReg := []interface{}{
		handlers.AgentHandler,
		handlers.AgentValidator,
	}

	terraformv1.TokenListMeta().RegisterAPIMethodGET(GETOverride)
	terraformv1.AgentMeta().RegisterAPIMethodGET(GETAgentOverride)
	terraformv1.AgentMeta().RegisterAPIMethodList(ListOverride)

	var apx service.Service
	var opts service.Options
	opts.PlatformFactory = platform.New
	apx = service.New("agent-manager", schema.Schema(), &opts)
	if apx == nil {
		panic("Could not create the service")
	}
	if err := apx.OnStart(onStart).
		Start(handlerReg...); err != nil {
		panic(err)
	}
}
