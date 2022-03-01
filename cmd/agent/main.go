package main

import (
	"context"
	"fmt"
	"net/http"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"

	"golang.cisco.com/terraform/gen/schema"
	"golang.cisco.com/terraform/gen/terraformv1"
	"golang.cisco.com/terraform/pkg/conf"
	"golang.cisco.com/terraform/pkg/handlers"
	"golang.cisco.com/terraform/pkg/platform"
)

func GETTokenListOverride(ctx context.Context, event *terraformv1.TokenListDbReadEvent) (terraformv1.TokenList, int, error) {
	payloadObject := event.Resource().(terraformv1.TokenList)
	agentPoolId := payloadObject.Spec().Agentpool()
	tfcContext, tfcClient, err := conf.ConfigTFC()
	if err != nil {
		er := fmt.Errorf("error from configTFC")
		return nil, http.StatusInternalServerError, core.NewError(err, er)
	}
	tokens, err := conf.QueryAgentTokens(tfcContext, tfcClient, agentPoolId)
	if err != nil {
		er := fmt.Errorf("error from QueryAgentTokens")
		return nil, http.StatusInternalServerError, core.NewError(err, er)
	}
	result := terraformv1.TokenListFactory()
	errors := make([]error, 0)
	for _, token := range tokens {
		errors = append(errors, result.SpecMutable().TokensAppendEl(token.ID))
	}
	errors = append(errors, result.SpecMutable().SetAgentpool(agentPoolId))
	if err := core.NewError(errors...); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return result, http.StatusOK, nil
}

func GETAgentOverride(ctx context.Context, event *terraformv1.AgentDbReadEvent) (terraformv1.Agent, int, error) {
	log := core.LoggerFromContext(ctx)
	name := event.Resource().(terraformv1.Agent).Spec().Name()
	obj, err := event.Store().ResolveByName(ctx, terraformv1.AgentDNForDefault(name))
	if err != nil {
		er := fmt.Errorf("error from ResolveByName")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	payloadObject := obj.(terraformv1.Agent)
	if err := core.NewError(payloadObject.SpecMutable().SetToken("********")); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	tlsClient := conf.ConfigTLSClient()
	features, err := conf.QueryFeatures(ctx, tlsClient)
	if err != nil {
		er := fmt.Errorf("error from QueryFeatures")
		return nil, http.StatusInternalServerError, core.NewError(err, er)
	}
	for _, feature := range features.Instances[0].Features {
		if feature.Instance == name {
			payloadObject.SpecMutable().SetStatus(feature.OperState)
		}
	}
	// query agent status only when userToken exists
	_, _, exist, err := conf.GetCredentials("terraform")
	if err != nil {
		er := fmt.Errorf("error while getting user token")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	agentPoolId := payloadObject.Spec().AgentpoolId()
	if agentPoolId != "" && exist {
		_, tfcClient, err := conf.ConfigTFC()
		if err != nil {
			er := fmt.Errorf("error from configTFC")
			return nil, http.StatusInternalServerError, core.NewError(err, er)
		}
		// get agentId by agentPoolId & agentName when userToken was provided by user
		agents, err := conf.QueryAgents(ctx, tlsClient, tfcClient, agentPoolId)
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
	tlsClient := conf.ConfigTLSClient()
	features, err := conf.QueryFeatures(ctx, tlsClient)
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
		agentPoolId := payloadObject.Spec().AgentpoolId()
		// query agent status only when userToken exists
		_, _, exist, err := conf.GetCredentials("terraform")
		if err != nil {
			er := fmt.Errorf("error while getting user token")
			return nil, http.StatusInternalServerError, core.NewError(er, err)
		}
		if agentPoolId != "" && exist {
			_, tfcClient, err := conf.ConfigTFC()
			if err != nil {
				er := fmt.Errorf("error during config TFC")
				return nil, http.StatusInternalServerError, core.NewError(er, err)
			}
			// get agentId by agentPoolId & agentName
			agents, err := conf.QueryAgents(ctx, tlsClient, tfcClient, agentPoolId)
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
	// get proxy config by api and set it as env var
	if err := conf.ProxyConfig(); err != nil {
		panic(err)
	}
	handlerReg := []interface{}{
		handlers.AgentHandler,
		handlers.AgentValidator,
	}

	terraformv1.TokenListMeta().RegisterAPIMethodGET(GETTokenListOverride)
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
