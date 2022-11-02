package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/hashicorp/go-tfe"
	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"

	"golang.cisco.com/terraform/gen/schema"
	"golang.cisco.com/terraform/gen/terraformv1"
	"golang.cisco.com/terraform/pkg/conf"
	"golang.cisco.com/terraform/pkg/handlers"
	"golang.cisco.com/terraform/pkg/platform"
)

func GETAgentPoolOverride(ctx context.Context, event *terraformv1.AgentpoolDbReadEvent) (terraformv1.Agentpool, int, error) {
	log := core.LoggerFromContext(ctx)

	log.Info("register overriding GET")
	payloadObject := event.Resource().(terraformv1.Agentpool)
	ctxTfe, client, err := conf.ConfigTFC()
	if err != nil {
		er := fmt.Errorf("error from configTFC")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	var agentPl *tfe.AgentPool
	var queryErr error
	if payloadObject.Spec().Id() != "" && payloadObject.Spec().IdPtr() != nil {
		agentID := payloadObject.Spec().Id()
		agentPl, queryErr = conf.QueryAgentPoolByID(ctxTfe, client, agentID)
	}
	if payloadObject.Spec().Organization() != "" && payloadObject.Spec().OrganizationPtr() != nil &&
		payloadObject.Spec().Name() != "" && payloadObject.Spec().NamePtr() != nil {
		agentPools, _ := conf.QueryAgentPools(ctxTfe, client, payloadObject.Spec().Organization())
		agentPl, queryErr = conf.QueryAgentPoolByName(agentPools, payloadObject.Spec().Name())
	}

	if queryErr != nil {
		er := fmt.Errorf("error from QueryAgentPoolByName")
		return nil, http.StatusInternalServerError, core.NewError(queryErr, er)
	}
	result := terraformv1.AgentpoolFactory()
	errors := make([]error, 0)
	errors = append(errors, result.SpecMutable().SetName(agentPl.Name),
		result.SpecMutable().SetOrganization(agentPl.Organization.Name),
		result.SpecMutable().SetId(agentPl.ID))

	if err := core.NewError(errors...); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return result, http.StatusOK, nil
}

func POSTOverride(ctx context.Context, event *terraformv1.AgentpoolDbCreateEvent) (terraformv1.Agentpool, int, error) {
	log := core.LoggerFromContext(ctx)

	log.Info("register overriding POST")

	payloadObject := event.Resource().(terraformv1.Agentpool)
	orgName := payloadObject.Spec().Organization()
	agentName := payloadObject.Spec().Name()
	ctxTfe, client, err := conf.ConfigTFC()
	if err != nil {
		er := fmt.Errorf("error from configTfc")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	agentPl, err := conf.CreateAgentPool(ctxTfe, client, orgName, agentName)
	if err != nil {
		er := fmt.Errorf("error from createAgentPool")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	result := terraformv1.AgentpoolFactory()
	errors := make([]error, 0)
	errors = append(errors, result.SpecMutable().SetName(agentPl.Name),
		result.SpecMutable().SetOrganization(agentPl.Organization.Name),
		result.SpecMutable().SetId(agentPl.ID),
		result.SpecMutable().SetName(agentName))
	if err := core.NewError(errors...); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return result, http.StatusOK, nil
}

func DELETEOverride(ctx context.Context, event *terraformv1.AgentpoolDbDeleteEvent) (int, error) {
	payloadObject := event.Resource().(terraformv1.Agentpool)
	ctxTfe, client, err := conf.ConfigTFC()
	if err != nil {
		er := fmt.Errorf("error from configTFC")
		return http.StatusInternalServerError, core.NewError(er, err)
	}
	id := payloadObject.Spec().Id()
	if id != "" {
		err := conf.DeleteAgentPool(ctxTfe, client, id)
		if err != nil {
			er := fmt.Errorf("error from deleteAgentPool")
			return http.StatusInternalServerError, core.NewError(err, er)
		}
	} else if payloadObject.Spec().Organization() != "" && payloadObject.Spec().OrganizationPtr() != nil &&
		payloadObject.Spec().Name() != "" && payloadObject.Spec().NamePtr() != nil {
		agentPools, _ := conf.QueryAgentPools(ctxTfe, client, payloadObject.Spec().Organization())
		agentPl, queryErr := conf.QueryAgentPoolByName(agentPools, payloadObject.Spec().Name())
		if queryErr != nil {
			er := fmt.Errorf("error from QueryAgentPoolByName")
			return http.StatusInternalServerError, core.NewError(er, queryErr)
		}
		err := conf.DeleteAgentPool(ctxTfe, client, agentPl.ID)
		if err != nil {
			er := fmt.Errorf("error form deleteAgentPool")
			return http.StatusInternalServerError, core.NewError(er, err)
		}
	}
	return http.StatusOK, nil
}

func GETAgentPoolListOverride(ctx context.Context, event *terraformv1.AgentpoolListDbReadEvent) (terraformv1.AgentpoolList, int, error) {
	log := core.LoggerFromContext(ctx)
	log.Info("register overriding GET for AgentpoolList")
	agentPoolList := event.Resource().(terraformv1.AgentpoolList)
	orgName := agentPoolList.Spec().Organization()
	ctxTfe, client, err := conf.ConfigTFC()
	if err != nil {
		er := fmt.Errorf("error from configTFC")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	agentPls, err := conf.QueryAgentPools(ctxTfe, client, orgName)
	if err != nil {
		er := fmt.Errorf("error from queryAgentPools")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	result := terraformv1.AgentpoolListFactory()
	errors := make([]error, 0)
	for _, agentPl := range agentPls {
		agentPlSpec := terraformv1.AgentplSpecFactory(nil, 0)
		errors = append(errors, agentPlSpec.SetName(agentPl.Name),
			agentPlSpec.SetId(agentPl.ID),
			result.SpecMutable().AgentpoolsAppendEl(agentPlSpec))
	}
	errors = append(errors, result.SpecMutable().SetOrganization(orgName))
	if err := core.NewError(errors...); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return result, http.StatusOK, nil
}

func onStart(ctx context.Context, changer mo.Changer) error {
	log := core.LoggerFromContext(ctx)

	log.Info("agentpool service starts")

	return nil
}

func main() {
	// get proxy config by api and set it as env var
	if err := conf.ProxyConfig(); err != nil {
		panic(err)
	}

	handlerReg := []interface{}{
		handlers.AgentpoolHandler,
	}

	terraformv1.AgentpoolMeta().RegisterAPIMethodGET(GETAgentPoolOverride)
	terraformv1.AgentpoolMeta().RegisterAPIMethodPOST(POSTOverride)
	terraformv1.AgentpoolMeta().RegisterAPIMethodDELETE(DELETEOverride)
	terraformv1.AgentpoolListMeta().RegisterAPIMethodGET(GETAgentPoolListOverride)

	var apx service.Service
	var opts service.Options
	opts.PlatformFactory = platform.New
	apx = service.New("agentpool-manager", schema.Schema(), &opts)
	if apx == nil {
		panic("Could not create the service")
	}
	if err := apx.OnStart(onStart).
		Start(handlerReg...); err != nil {
		panic(err)
	}
}
