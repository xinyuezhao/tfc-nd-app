package main

import (
	"context"
	"fmt"
	"net/http"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"
	"golang.cisco.com/argo/pkg/utils"

	"golang.cisco.com/examples/terraform/gen/schema"
	"golang.cisco.com/examples/terraform/gen/terraformv1"
	"golang.cisco.com/examples/terraform/pkg/conf"
	"golang.cisco.com/examples/terraform/pkg/handlers"
	"golang.cisco.com/examples/terraform/pkg/platform"
)

func ListOverride(ctx context.Context, event *mo.TypeHandlerEvent) ([]terraformv1.Organization, int, error) {
	ctxTfe, client, err := conf.ConfigTFC()
	if err != nil {
		er := fmt.Errorf("error from configTFC")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	// Query all organizations and filter orgs by entitlement
	orgs, err := conf.QueryAllOrgs(ctxTfe, client)
	if err != nil {
		er := fmt.Errorf("error from queryAllOrgs")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	res := make([]terraformv1.Organization, 0)
	for _, org := range orgs {
		newOrg := terraformv1.OrganizationFactory()
		err := conf.NewOrganization(org, newOrg)
		if err != nil {
			er := fmt.Errorf("error from newOrganizaton")
			return nil, http.StatusInternalServerError, core.NewError(er, err)
		}
		res = append(res, newOrg)
	}
	return res, http.StatusOK, nil
}

func GETOverride(ctx context.Context, event *terraformv1.OrganizationDbReadEvent) (terraformv1.Organization, int, error) {
	payloadObject := event.Resource().(terraformv1.Organization)
	name := payloadObject.Spec().Name()
	ctxTfe, client, err := conf.ConfigTFC()
	if err != nil {
		er := fmt.Errorf("error form configTFC")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	orgs, err := conf.QueryAllOrgs(ctxTfe, client)
	if err != nil {
		er := fmt.Errorf("error form queryAllOrgs")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}

	for _, org := range orgs {
		if org.Name == name {
			newOrg := terraformv1.OrganizationFactory()
			err := conf.NewOrganization(org, newOrg)
			if err == nil {
				return newOrg, http.StatusOK, nil
			}
		}
	}
	errMsg := utils.ErrorsNew(name + " not found")
	return nil, http.StatusNotFound, errMsg
}

func onStart(ctx context.Context, changer mo.Changer) error {
	log := core.LoggerFromContext(ctx)

	log.Info("register overriding GET and List during app start")
	return nil
}

func main() {
	// get proxy config by api and set it as env var
	if err := conf.ProxyConfig(); err != nil {
		panic(err)
	}

	handlerReg := []interface{}{
		handlers.OrganizationHandler,
	}

	terraformv1.OrganizationMeta().RegisterAPIMethodList(ListOverride)
	terraformv1.OrganizationMeta().RegisterAPIMethodGET(GETOverride)

	var apx service.Service
	var opts service.Options
	opts.PlatformFactory = platform.New
	apx = service.New("organization-manager", schema.Schema(), &opts)
	if apx == nil {
		panic("Could not create the service")
	}
	if err := apx.OnStart(onStart).
		Start(handlerReg...); err != nil {
		panic(err)
	}
}
