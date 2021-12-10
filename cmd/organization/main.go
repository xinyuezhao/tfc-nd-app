package main

import (
	"context"
	"fmt"
	"net/http"

	tfe "github.com/hashicorp/go-tfe"

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

func queryAllOrgs(ctx context.Context, client *tfe.Client) ([]*tfe.Organization, error) {
	var res []*tfe.Organization
	orgs, err := client.Organizations.List(ctx, tfe.OrganizationListOptions{})
	if err != nil {
		return nil, err
	}
	// filter orgs by entitlement
	for _, element := range orgs.Items {
		entitlements, ers := client.Organizations.Entitlements(ctx, element.Name)
		if ers != nil {
			return nil, ers
		}
		if entitlements.Agents {
			res = append(res, element)
		}
	}
	return res, nil
}

func newOrganization(org *tfe.Organization, newOrg terraformv1.Organization) error {
	errs := make([]error, 0)
	errs = append(errs, newOrg.SpecMutable().SetName(org.Name),
		newOrg.SpecMutable().SetEmail(org.Email),
		newOrg.SpecMutable().SetCollaboratorAuthPolicy(string(org.CollaboratorAuthPolicy)),
		newOrg.SpecMutable().SetCostEstimationEnabled(org.CostEstimationEnabled),
		newOrg.SpecMutable().SetCreatedAt(org.CreatedAt.String()),
		newOrg.SpecMutable().SetExternalID(org.ExternalID),
		newOrg.SpecMutable().SetOwnersTeamSAMLRoleI(org.OwnersTeamSAMLRoleID),
		newOrg.SpecMutable().SetSAMLEnabled(org.SAMLEnabled),
		newOrg.SpecMutable().SetSessionRemember(org.SessionRemember),
		newOrg.SpecMutable().SetSessionTimeout(org.SessionTimeout),
		newOrg.SpecMutable().SetTrialExpiresAt(org.TrialExpiresAt.String()),
		newOrg.SpecMutable().SetTwoFactorConformant(org.TwoFactorConformant),
		newOrg.Spec().Permissions().MutableOrganizationPermissionsV1Terraform().SetCanCreateTeam(org.Permissions.CanCreateTeam),
		newOrg.Spec().Permissions().MutableOrganizationPermissionsV1Terraform().
			SetCanCreateWorkspace(org.Permissions.CanCreateWorkspace),
		newOrg.Spec().Permissions().MutableOrganizationPermissionsV1Terraform().
			SetCanCreateWorkspaceMigration(org.Permissions.CanCreateWorkspaceMigration),
		newOrg.Spec().Permissions().MutableOrganizationPermissionsV1Terraform().
			SetCanDestroy(org.Permissions.CanDestroy),
		newOrg.Spec().Permissions().MutableOrganizationPermissionsV1Terraform().
			SetCanTraverse(org.Permissions.CanTraverse),
		newOrg.Spec().Permissions().MutableOrganizationPermissionsV1Terraform().
			SetCanUpdate(org.Permissions.CanUpdate),
		newOrg.Spec().Permissions().MutableOrganizationPermissionsV1Terraform().
			SetCanUpdateAPIToken(org.Permissions.CanUpdateAPIToken),
		newOrg.Spec().Permissions().MutableOrganizationPermissionsV1Terraform().
			SetCanUpdateOAuth(org.Permissions.CanUpdateOAuth),
		newOrg.Spec().Permissions().MutableOrganizationPermissionsV1Terraform().
			SetCanUpdateSentinel(org.Permissions.CanUpdateSentinel))
	if err := core.NewError(errs...); err != nil {
		return err
	}
	return nil
}

func ListOverride(ctx context.Context, event *mo.TypeHandlerEvent) ([]terraformv1.Organization, int, error) {
	ctxTfe, client, err := conf.ConfigTFC()
	if err != nil {
		er := fmt.Errorf("error from configTFC")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	// Query all organizations and filter orgs by entitlement
	orgs, err := queryAllOrgs(ctxTfe, client)
	if err != nil {
		er := fmt.Errorf("error from queryAllOrgs")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	res := make([]terraformv1.Organization, 0)
	for _, org := range orgs {
		newOrg := terraformv1.OrganizationFactory()
		err := newOrganization(org, newOrg)
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
	orgs, err := queryAllOrgs(ctxTfe, client)
	if err != nil {
		er := fmt.Errorf("error form queryAllOrgs")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}

	for _, org := range orgs {
		if org.Name == name {
			newOrg := terraformv1.OrganizationFactory()
			err := newOrganization(org, newOrg)
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
