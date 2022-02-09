package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/hashicorp/go-tfe"
	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"

	"golang.cisco.com/examples/terraform/gen/schema"
	"golang.cisco.com/examples/terraform/gen/terraformv1"
	"golang.cisco.com/examples/terraform/pkg/conf"
	"golang.cisco.com/examples/terraform/pkg/handlers"
	"golang.cisco.com/examples/terraform/pkg/platform"
)

func GETOverride(ctx context.Context, event *terraformv1.AgentpoolDbReadEvent) (terraformv1.Agentpool, int, error) {
	log := core.LoggerFromContext(ctx)

	log.Info("register overriding GET")
	log.Info("show indentity " + event.ID())
	log.Info("show dn " + event.DN())
	log.Info("org name is " + event.Resource().(terraformv1.Agentpool).Spec().Organization())
	log.Info("agentPl name is " + event.Resource().(terraformv1.Agentpool).Spec().Name())
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
		agentPl, queryErr = conf.QueryAgentPlByID(ctxTfe, client, agentID)
	}
	if payloadObject.Spec().Organization() != "" && payloadObject.Spec().OrganizationPtr() != nil &&
		payloadObject.Spec().Name() != "" && payloadObject.Spec().NamePtr() != nil {
		agentPools, _ := conf.QueryAgentPools(ctxTfe, client, payloadObject.Spec().Organization())
		agentPl, queryErr = conf.QueryAgentPlByName(agentPools, payloadObject.Spec().Name())
	}

	if queryErr != nil {
		er := fmt.Errorf("error from queryAgentPlByName")
		return nil, http.StatusInternalServerError, core.NewError(queryErr, er)
	}
	result := terraformv1.AgentpoolFactory()
	errs := make([]error, 0)
	errs = append(errs, result.SpecMutable().SetName(agentPl.Name),
		result.SpecMutable().SetOrganization(agentPl.Organization.Name),
		result.SpecMutable().SetId(agentPl.ID))

	if err := core.NewError(errs...); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return result, http.StatusOK, nil
}

func POSTOverride(ctx context.Context, event *terraformv1.AgentpoolDbCreateEvent) (terraformv1.Agentpool, int, error) {
	log := core.LoggerFromContext(ctx)

	log.Info("register overriding POST")
	log.Info("show indentity " + event.ID())
	log.Info("show dn " + event.DN())
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
	errs := make([]error, 0)
	errs = append(errs, result.SpecMutable().SetName(agentPl.Name),
		result.SpecMutable().SetOrganization(agentPl.Organization.Name),
		result.SpecMutable().SetId(agentPl.ID),
		result.SpecMutable().SetName(agentName))
	if err := core.NewError(errs...); err != nil {
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
	if payloadObject.Spec().Id() != "" && payloadObject.Spec().IdPtr() != nil {
		err := conf.DeleteAgentPool(ctxTfe, client, payloadObject.Spec().Id())
		if err != nil {
			er := fmt.Errorf("error from deleteAgentPool")
			return http.StatusInternalServerError, core.NewError(err, er)
		}
	}
	if payloadObject.Spec().Organization() != "" && payloadObject.Spec().OrganizationPtr() != nil &&
		payloadObject.Spec().Name() != "" && payloadObject.Spec().NamePtr() != nil {
		agentPools, _ := conf.QueryAgentPools(ctxTfe, client, payloadObject.Spec().Organization())
		agentPl, queryErr := conf.QueryAgentPlByName(agentPools, payloadObject.Spec().Name())
		if queryErr != nil {
			er := fmt.Errorf("error form queryAgentPlByName")
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

func GETAgentpoolListOverride(ctx context.Context, event *terraformv1.AgentpoolListDbReadEvent) (terraformv1.AgentpoolList, int, error) {
	log := core.LoggerFromContext(ctx)
	log.Info("register overriding GET for AgentpoolList")
	orgAgentPl := event.Resource().(terraformv1.AgentpoolList)
	orgName := orgAgentPl.Spec().Organization()
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
	errs := make([]error, 0)
	for _, agentPl := range agentPls {
		agentPlSpec := terraformv1.AgentplSpecFactory(nil, 0)
		errs = append(errs, agentPlSpec.SetName(agentPl.Name),
			agentPlSpec.SetId(agentPl.ID),
			result.SpecMutable().AgentpoolsAppendEl(agentPlSpec))
	}
	errs = append(errs, result.SpecMutable().SetOrganization(orgName))
	if err := core.NewError(errs...); err != nil {
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

	terraformv1.AgentpoolMeta().RegisterAPIMethodGET(GETOverride)
	terraformv1.AgentpoolMeta().RegisterAPIMethodPOST(POSTOverride)
	terraformv1.AgentpoolMeta().RegisterAPIMethodDELETE(DELETEOverride)
	terraformv1.AgentpoolListMeta().RegisterAPIMethodGET(GETAgentpoolListOverride)

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
