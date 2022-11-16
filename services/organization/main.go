package main

import (
	"context"
	"fmt"
	"net/http"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"
	"golang.cisco.com/argo/pkg/utils"

	"golang.cisco.com/terraform/gen/schema"
	"golang.cisco.com/terraform/gen/terraformv1"
	"golang.cisco.com/terraform/pkg/conf"
	"golang.cisco.com/terraform/pkg/handlers"
	"golang.cisco.com/terraform/pkg/platform"
)

func ListOverride(ctx context.Context, event *mo.TypeHandlerEvent) ([]terraformv1.Organization, int, error) {
	log := core.LoggerFromContext(ctx)
	log.Info("register ListOverride for org")
	ctxTfe, client, err := conf.ConfigTFC()
	if err != nil {
		er := fmt.Errorf("error from configTFC while querying organizations")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	log.Info("Query all organizations and filter orgs by entitlement")
	// Query all organizations and filter orgs by entitlement
	orgs, err := conf.QueryAllOrgs(ctxTfe, client)
	log.Info("After query all orgs")
	if err != nil {
		er := fmt.Errorf("error from queryAllOrgs")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	// organizationList := make([]terraformv1.Organization, 0)
	// for _, org := range orgs {
	// 	orgObject := terraformv1.OrganizationFactory()
	// 	err := conf.NewOrganization(org, orgObject)
	// 	if err != nil {
	// 		continue
	// 	}
	// 	organizationList = append(organizationList, orgObject)
	// }
	// return organizationList, http.StatusOK, nil
	return orgs, http.StatusOK, nil
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

	// for _, org := range orgs {
	// 	if org.Name == name {
	// 		orgObject := terraformv1.OrganizationFactory()
	// 		err := conf.NewOrganization(org, orgObject)
	// 		if err == nil {
	// 			return orgObject, http.StatusOK, nil
	// 		}
	// 	}
	// }
	for _, org := range orgs {
		if org.Spec().Name() == name {
			return org, http.StatusOK, nil
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