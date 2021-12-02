package main

import (
	"context"
	"net/http"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"

	"golang.cisco.com/examples/argome/gen/argomev1"
	"golang.cisco.com/examples/argome/gen/schema"
	"golang.cisco.com/examples/argome/pkg/conf"
	"golang.cisco.com/examples/argome/pkg/handlers"
	"golang.cisco.com/examples/argome/pkg/platform"
)

func GETOverride(ctx context.Context, event *argomev1.TokenListDbReadEvent) (argomev1.TokenList, int, error) {
	payloadObject := event.Resource().(argomev1.TokenList)
	agentPlId := payloadObject.Spec().Agentpool()
	ctxTfe, client, err := conf.ConfigTFC()
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	tokens, err := conf.QueryAgentTokens(ctxTfe, client, agentPlId)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	result := argomev1.TokenListFactory()
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

func GETAgentOverride(ctx context.Context, event *argomev1.AgentDbReadEvent) (argomev1.Agent, int, error) {
	log := core.LoggerFromContext(ctx)
	name := event.Resource().(argomev1.Agent).Spec().Name()
	obj, err := event.Store().ResolveByName(ctx, argomev1.AgentDNForDefault(name))
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	payloadObject := obj.(argomev1.Agent)
	if err := core.NewError(payloadObject.SpecMutable().SetToken("********")); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	// get agentPoolId
	agentPlId := payloadObject.Spec().AgentpoolId()
	TLSclient := conf.ConfigTLSClient(ctx)
	_, TFEclient, err := conf.ConfigTFC()
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	// get agentId by agentPoolId & agentName
	agents, err := conf.QueryAgents(ctx, TLSclient, TFEclient, agentPlId)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	agentId := conf.QueryAgentId(ctx, agents, name)
	// call feature api to get feature instance status
	// whether query feature instance operstate right after it was created?
	features, err := conf.QueryFeatures(ctx, TLSclient)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	for _, feature := range features.Instances[0].Features {
		if feature.Instance == name {
			payloadObject.SpecMutable().SetStatus(feature.OperState)
		}
	}
	// query status
	status := payloadObject.Spec().Status()
	if status == "Running" {
		if agentId != "" {
			log.Info("id used to query status " + agentId)
			status, err := conf.QueryAgentStatus(ctx, agentId)
			if err != nil {
				return nil, http.StatusInternalServerError, err
			}
			if err := core.NewError(payloadObject.SpecMutable().SetStatus(status)); err != nil {
				return nil, http.StatusInternalServerError, err
			}
		}
	}
	return payloadObject, http.StatusOK, nil
}

func ListOverride(ctx context.Context, event *mo.TypeHandlerEvent) ([]argomev1.Agent, int, error) {
	log := core.LoggerFromContext(ctx)
	objs := event.Resolver.ResolveByKind(ctx, argomev1.AgentMeta().MetaKey())
	result := make([]argomev1.Agent, 0)
	TLSclient := conf.ConfigTLSClient(ctx)
	_, TFEclient, err := conf.ConfigTFC()
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	features, err := conf.QueryFeatures(ctx, TLSclient)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	for _, obj := range objs {
		payloadObject := obj.(argomev1.Agent)
		if err := core.NewError(payloadObject.SpecMutable().SetToken("********")); err != nil {
			return nil, http.StatusInternalServerError, err
		}
		// get agentPoolId
		agentPlId := payloadObject.Spec().AgentpoolId()
		// get agentId by agentPoolId & agentName
		agents, err := conf.QueryAgents(ctx, TLSclient, TFEclient, agentPlId)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}
		name := payloadObject.Spec().Name()
		agentId := conf.QueryAgentId(ctx, agents, name)
		for _, feature := range features.Instances[0].Features {
			if feature.Instance == name {
				payloadObject.SpecMutable().SetStatus(feature.OperState)
			}
		}
		status := payloadObject.Spec().Status()
		log.Info("status before query status by id " + status)
		if status == "Running" {
			if agentId != "" {
				log.Info("query agents' status " + agentId)
				status, err := conf.QueryAgentStatus(ctx, agentId)
				if err != nil {
					return nil, http.StatusInternalServerError, err
				}
				if err := core.NewError(payloadObject.SpecMutable().SetStatus(status)); err != nil {
					return nil, http.StatusInternalServerError, err
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

	argomev1.TokenListMeta().RegisterAPIMethodGET(GETOverride)
	argomev1.AgentMeta().RegisterAPIMethodGET(GETAgentOverride)
	argomev1.AgentMeta().RegisterAPIMethodList(ListOverride)

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
