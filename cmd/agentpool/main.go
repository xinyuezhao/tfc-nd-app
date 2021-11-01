package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/hashicorp/go-tfe"
	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"

	"golang.cisco.com/examples/argome/gen/argomev1"
	"golang.cisco.com/examples/argome/gen/schema"
	"golang.cisco.com/examples/argome/pkg/handlers"
	"golang.cisco.com/examples/argome/pkg/platform"
)

func configTFC() (context.Context, *tfe.Client, error) {
	config := &tfe.Config{
		Token: "ai1yMKOzv3Mptg.atlasv1.lOseEHJzlB49Vz0fXTlFUFRGGTuugiP3040sr1MGGOkHgRqzQ9FrpiUJzyTH1DzzFTM",
	}
	client, err := tfe.NewClient(config)
	if err != nil {
		return nil, nil, err
	}
	// Create a context
	ctxTfe := context.Background()
	return ctxTfe, client, nil
}

// Create a new agentPool for an organization
func createAgentPool(ctx context.Context, client *tfe.Client, orgName, agentPlName string) (*tfe.AgentPool, error) {
	createOptions := tfe.AgentPoolCreateOptions{Name: &agentPlName}
	agentPl, err := client.AgentPools.Create(ctx, orgName, createOptions)
	if err != nil {
		return nil, err
	}
	return agentPl, nil
}

// Query all agentPools for an organization
func queryAgentPools(ctx context.Context, client *tfe.Client, name string) ([]*tfe.AgentPool, error) {
	agentPools, err := client.AgentPools.List(ctx, name, tfe.AgentPoolListOptions{})
	if err != nil {
		return nil, err
	}
	res := agentPools.Items
	return res, nil
}

// Query agentPool by the name
func queryAgentPlByName(agentPools []*tfe.AgentPool, name string) (*tfe.AgentPool, error) {
	for _, agentPl := range agentPools {
		if agentPl.Name == name {
			return agentPl, nil
		}
	}
	return nil, fmt.Errorf(fmt.Sprintf("There is no agentPool named %v", name))
}

func queryAgentPlByID(ctx context.Context, client *tfe.Client, agentID string) (*tfe.AgentPool, error) {
	agentPool, err := client.AgentPools.Read(ctx, agentID)
	if err != nil {
		return nil, err
	}
	return agentPool, nil
}

func deleteAgentPool(ctx context.Context, client *tfe.Client, agentID string) error {
	err := client.AgentPools.Delete(ctx, agentID)
	if err != nil {
		return err
	}
	return nil
}

func GETOverride(ctx context.Context, event *argomev1.AgentpoolDbReadEvent) (argomev1.Agentpool, int, error) {
	log := core.LoggerFromContext(ctx)

	log.Info("register overriding GET")
	log.Info("show indentity " + event.ID())
	log.Info("show dn " + event.DN())
	log.Info("org name is " + event.Resource().(argomev1.Agentpool).Spec().Organization())
	log.Info("agentPl name is " + event.Resource().(argomev1.Agentpool).Spec().Name())
	payloadObject := event.Resource().(argomev1.Agentpool)
	ctxTfe, client, err := configTFC()
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	var agentPl *tfe.AgentPool
	var queryErr error
	if payloadObject.Spec().Id() != "" && payloadObject.Spec().IdPtr() != nil {
		agentID := payloadObject.Spec().Id()
		agentPl, queryErr = queryAgentPlByID(ctxTfe, client, agentID)
	}
	if payloadObject.Spec().Organization() != "" && payloadObject.Spec().OrganizationPtr() != nil &&
		payloadObject.Spec().Name() != "" && payloadObject.Spec().NamePtr() != nil {
		agentPools, _ := queryAgentPools(ctxTfe, client, payloadObject.Spec().Organization())
		agentPl, queryErr = queryAgentPlByName(agentPools, payloadObject.Spec().Name())
	}

	if queryErr != nil {
		return nil, http.StatusInternalServerError, queryErr
	}
	result := argomev1.AgentpoolFactory()
	errs := make([]error, 0)
	errs = append(errs, result.SpecMutable().SetName(agentPl.Name),
		result.SpecMutable().SetOrganization(agentPl.Organization.Name),
		result.SpecMutable().SetId(agentPl.ID))

	if err := core.NewError(errs...); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return result, http.StatusOK, nil
}

func POSTOverride(ctx context.Context, event *argomev1.AgentpoolDbCreateEvent) (argomev1.Agentpool, int, error) {
	log := core.LoggerFromContext(ctx)

	log.Info("register overriding POST")
	log.Info("show indentity " + event.ID())
	log.Info("show dn " + event.DN())
	payloadObject := event.Resource().(argomev1.Agentpool)
	orgName := payloadObject.Spec().Organization()
	agentName := payloadObject.Spec().Name()
	ctxTfe, client, err := configTFC()
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	agentPl, err := createAgentPool(ctxTfe, client, orgName, agentName)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	result := argomev1.AgentpoolFactory()
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

func DELETEOverride(ctx context.Context, event *argomev1.AgentpoolDbDeleteEvent) (int, error) {
	payloadObject := event.Resource().(argomev1.Agentpool)
	ctxTfe, client, err := configTFC()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if payloadObject.Spec().Id() != "" && payloadObject.Spec().IdPtr() != nil {
		err := deleteAgentPool(ctxTfe, client, payloadObject.Spec().Id())
		if err != nil {
			return http.StatusInternalServerError, err
		}
	}
	if payloadObject.Spec().Organization() != "" && payloadObject.Spec().OrganizationPtr() != nil &&
		payloadObject.Spec().Name() != "" && payloadObject.Spec().NamePtr() != nil {
		agentPools, _ := queryAgentPools(ctxTfe, client, payloadObject.Spec().Organization())
		agentPl, queryErr := queryAgentPlByName(agentPools, payloadObject.Spec().Name())
		if queryErr != nil {
			return http.StatusInternalServerError, queryErr
		}
		err := deleteAgentPool(ctxTfe, client, agentPl.ID)
		if err != nil {
			return http.StatusInternalServerError, err
		}
	}
	return http.StatusOK, nil
}

func GETAgentpoolListOverride(ctx context.Context, event *argomev1.AgentpoolListDbReadEvent) (argomev1.AgentpoolList, int, error) {
	log := core.LoggerFromContext(ctx)
	log.Info("register overriding GET for AgentpoolList")
	orgAgentPl := event.Resource().(argomev1.AgentpoolList)
	orgName := orgAgentPl.Spec().Organization()
	ctxTfe, client, err := configTFC()
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	agentPls, err := queryAgentPools(ctxTfe, client, orgName)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	result := argomev1.AgentpoolListFactory()
	errs := make([]error, 0)
	for _, agentPl := range agentPls {
		agentPlSpec := argomev1.AgentplSpecFactory(nil, 0)
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
	handlerReg := []interface{}{
		handlers.AgentpoolHandler,
	}

	argomev1.AgentpoolMeta().RegisterAPIMethodGET(GETOverride)
	argomev1.AgentpoolMeta().RegisterAPIMethodPOST(POSTOverride)
	argomev1.AgentpoolMeta().RegisterAPIMethodDELETE(DELETEOverride)
	argomev1.AgentpoolListMeta().RegisterAPIMethodGET(GETAgentpoolListOverride)

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
