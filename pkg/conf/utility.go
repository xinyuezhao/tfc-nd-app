package conf

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httputil"

	"github.com/hashicorp/go-tfe"
	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/examples/terraform/gen/terraformv1"
)

// Create a new agentPool for an organization
func CreateAgentPool(ctx context.Context, client *tfe.Client, orgName, agentPlName string) (*tfe.AgentPool, error) {
	createOptions := tfe.AgentPoolCreateOptions{Name: &agentPlName}
	agentPl, err := client.AgentPools.Create(ctx, orgName, createOptions)
	if err != nil {
		er := fmt.Errorf("error while creating agentpool")
		return nil, core.NewError(er, err)
	}
	return agentPl, nil
}

func QueryAgentPlByID(ctx context.Context, client *tfe.Client, agentID string) (*tfe.AgentPool, error) {
	agentPool, err := client.AgentPools.Read(ctx, agentID)
	if err != nil {
		er := fmt.Errorf("error while reading agentpool by ID")
		return nil, core.NewError(er, err)
	}
	return agentPool, nil
}

func DeleteAgentPool(ctx context.Context, client *tfe.Client, agentID string) error {
	err := client.AgentPools.Delete(ctx, agentID)
	if err != nil {
		er := fmt.Errorf("error while deleting agentpool")
		return core.NewError(er, err)
	}
	return nil
}

// Query AgentTokens in an agentPool
func QueryAgentTokens(ctx context.Context, client *tfe.Client, agentPlID string) ([]*tfe.AgentToken, error) {
	agentTokens, err := client.AgentTokens.List(ctx, agentPlID)
	if err != nil {
		er := fmt.Errorf("error while listing agentTokens")
		return nil, core.NewError(er, err)
	}
	res := agentTokens.Items
	return res, nil
}

func QueryAgents(ctx context.Context, client *http.Client, tfeClient *tfe.Client, agentplId string) ([]Agent, error) {
	log := core.LoggerFromContext(ctx)
	// query agents in given agentpool
	url := fmt.Sprintf("https://app.terraform.io/api/v2/agent-pools/%s/agents", agentplId)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		er := fmt.Errorf("error while building request to query agents")
		return nil, core.NewError(er, err)
	}
	tokenExist, Usertoken, err := CheckUserTokenExist()
	if !tokenExist || err != nil {
		er := fmt.Errorf("error from CheckUserTokenExist")
		return nil, core.NewError(er, err)
	}
	auth := fmt.Sprintf("Bearer %s", Usertoken)
	req.Header.Set("Authorization", auth)
	resp, e := client.Do(req)
	if e != nil {
		er := fmt.Errorf("error while sending request to query agents")
		return nil, core.NewError(er, e)
	}
	defer resp.Body.Close()
	b, err := httputil.DumpResponse(resp, true)
	log.Info("parsing response data")
	if err != nil {
		er := fmt.Errorf("error while dumping response of querying agents")
		return nil, core.NewError(er, err)
	}
	log.Info("response " + string(b))
	log.Info("respose status " + resp.Status)
	if resp.StatusCode != 200 {
		err := core.NewError(fmt.Errorf("error while querying agents. Response content: %s", string(b)))
		return nil, err
	}
	result := Agents{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		er := fmt.Errorf("error while parsing agents")
		return nil, core.NewError(er, err)
	}
	return result.Data, nil
}

func QueryAgentId(ctx context.Context, agents []Agent, name string) string {
	log := core.LoggerFromContext(ctx)
	for _, agent := range agents {
		log.Info(fmt.Sprintf("agent queried %s, status: %s", agent.Attributes.Name, agent.Attributes.Status))
		if agent.Attributes.Name == name && agent.Attributes.Status == "idle" {
			return agent.Id
		}
	}
	return ""
}

func QueryFeatures(ctx context.Context, client *http.Client) (Feature, error) {
	log := core.LoggerFromContext(ctx)
	result := Feature{}
	req, err := http.NewRequest(http.MethodGet, "https://resourcemgr.kubese.svc/api/config/dn/appinstances/cisco-terraform", nil)
	if err != nil {
		er := fmt.Errorf("error while building request to query featureinstance")
		return result, core.NewError(er, err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		er := fmt.Errorf("error while sending request to query featureinstance")
		return result, core.NewError(er, err)
	}
	defer resp.Body.Close()
	b, err := httputil.DumpResponse(resp, true)
	log.Info("parsing response data")
	if err != nil {
		er := fmt.Errorf("error while dumping response of featureinstance")
		return result, core.NewError(er, err)
	}
	log.Info("response " + string(b))
	log.Info("respose status " + resp.Status)
	if resp.StatusCode != 200 {
		err := core.NewError(fmt.Errorf("error while querying features. Response content: %s", string(b)))
		return result, err
	}

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		er := fmt.Errorf("error while decoding feature")
		return result, core.NewError(er, err)
	}
	for _, feature := range result.Instances[0].Features {
		log.Info("feature instance " + feature.Instance)
		log.Info("feature status " + feature.OperState)
		log.Info("feature config name " + feature.ConfigParameters.Name)
		log.Info("feature config token " + feature.ConfigParameters.Token)
	}
	return result, nil
}

func ConfigTFC() (context.Context, *tfe.Client, error) {
	tokenExist, Usertoken, err := CheckUserTokenExist()
	if !tokenExist || err != nil {
		er := core.NewError(err, fmt.Errorf("not able to get userToken"))
		return nil, nil, core.NewError(er, err)
	}
	config := &tfe.Config{
		Token: Usertoken,
	}
	client, err := tfe.NewClient(config)
	if err != nil {
		er := fmt.Errorf("error from NewClient")
		return nil, nil, core.NewError(er, err)
	}
	// Create a context
	ctxTfe := context.Background()
	return ctxTfe, client, nil
}

func ConfigTLSClient() *http.Client {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}
	return client
}

// Query agentPool by the name
func QueryAgentPlByName(agentPools []*tfe.AgentPool, name string) (*tfe.AgentPool, error) {
	for _, agentPl := range agentPools {
		if agentPl.Name == name {
			return agentPl, nil
		}
	}
	return nil, fmt.Errorf(fmt.Sprintf("There is no agentPool named %v", name))
}

// Query all agentPools for an organization
func QueryAgentPools(ctx context.Context, client *tfe.Client, name string) ([]*tfe.AgentPool, error) {
	agentPools, err := client.AgentPools.List(ctx, name, tfe.AgentPoolListOptions{})
	if err != nil {
		er := fmt.Errorf("error while listing agentpools")
		return nil, core.NewError(er, err)
	}
	res := agentPools.Items
	return res, nil
}

// Create a new agentToken
func CreateAgentToken(ctx context.Context, client *tfe.Client, agentPool, organization, desc string) (*tfe.AgentToken, string, error) {
	agentPools, _ := QueryAgentPools(ctx, client, organization)
	agentPl, queryErr := QueryAgentPlByName(agentPools, agentPool)
	if queryErr != nil {
		er := fmt.Errorf("error from QueryAgentPlByName while creating agentToken")
		return nil, "", core.NewError(er, queryErr)
	}
	agentToken, err := client.AgentTokens.Generate(ctx, agentPl.ID, tfe.AgentTokenGenerateOptions{Description: &desc})
	if err != nil {
		er := fmt.Errorf("error while generating agentToken")
		return nil, "", core.NewError(er, err)
	}
	agentPlID := agentPl.ID
	return agentToken, agentPlID, nil
}

// Delete an existing agentToken
func RemoveAgentToken(ctx context.Context, client *tfe.Client, agentTokenID string) error {
	err := client.AgentTokens.Delete(ctx, agentTokenID)
	if err != nil {
		er := fmt.Errorf("error while deleting agentToken")
		return core.NewError(er, err)
	}
	return nil
}

// Delete an existing feature instance to stop agent
func DelFeatureInstance(ctx context.Context, client *http.Client, name string) error {
	log := core.LoggerFromContext(ctx)
	payload := map[string]string{
		"featureName": FeatureName,
		"app":         App,
		"instance":    name,
		"version":     Version,
		"vendor":      Vendor,
	}
	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(payload)
	req, err := http.NewRequest(http.MethodPost, "https://resourcemgr.kubese.svc/api/config/delfeatureinstance", payloadBuf)
	if err != nil {
		er := fmt.Errorf("error while building request to delete featureinstance")
		return core.NewError(er, err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		er := fmt.Errorf("error while sending request to delete featureinstance")
		return core.NewError(er, err)
	}
	b, err := httputil.DumpResponse(resp, true)
	log.Info(fmt.Sprintf("parsing response data %s", string(b)))
	if err != nil {
		er := fmt.Errorf("error while parsing response")
		return core.NewError(er, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		err := core.NewError(fmt.Errorf("error while deleting feature instance. Response content: %s", string(b)))
		return err
	}
	return nil
}

func QueryAgentStatus(ctx context.Context, agentId string) (string, error) {
	log := core.LoggerFromContext(ctx)
	client := ConfigTLSClient()
	// query agents inside given agentpool
	log.Info("agent Id given " + agentId)
	url := fmt.Sprintf("https://app.terraform.io/api/v2/agents/%s", agentId)
	log.Info("query url " + url)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		er := fmt.Errorf("error while building request to query agent status")
		return "", core.NewError(er, err)
	}
	tokenExist, Usertoken, err := CheckUserTokenExist()
	if !tokenExist || err != nil {
		er := fmt.Errorf("error from checkUserTokenExist while querying agent status")
		return "", core.NewError(er, err)
	}
	// use user token to access terraform cloud API
	auth := fmt.Sprintf("Bearer %s", Usertoken)
	req.Header.Set("Authorization", auth)
	resp, e := client.Do(req)
	if e != nil {
		er := fmt.Errorf("error while sending request to query agent status")
		return "", core.NewError(er, e)
	}
	defer resp.Body.Close()
	b, err := httputil.DumpResponse(resp, true)
	log.Info("parsing response data")
	if err != nil {
		er := fmt.Errorf("error while parsing agent status response")
		return "", core.NewError(er, err)
	}
	log.Info("after parse response data")
	log.Info("response " + string(b))
	log.Info("respose status " + resp.Status)
	if resp.StatusCode != 200 {
		err := core.NewError(fmt.Errorf("there is an error. Response content: %s", string(b)))
		return "", err
	}
	agentObj := AgentStatus{}
	log.Info("before parsing resp.Body")
	err = json.NewDecoder(resp.Body).Decode(&agentObj)
	if err != nil {
		er := fmt.Errorf("error while parsing agent status")
		return "", core.NewError(er, err)
	}
	log.Info("after parsing resp.Body")
	return agentObj.Data.Attributes.Status, err
}

// Delete an existing agentPool
func RemoveAgentPool(ctx context.Context, client *tfe.Client, agentPlID string) error {
	err := client.AgentPools.Delete(ctx, agentPlID)
	if err != nil {
		er := fmt.Errorf("error while deleting agentpool")
		return core.NewError(er, err)
	}
	return nil
}

// Add credentials
func AddCredentials(ctx context.Context, name string, token string) error {
	log := core.LoggerFromContext(ctx)
	log.Info("start adding credentials")
	client := ConfigTLSClient()
	payload := map[string]interface{}{
		"components": map[string]interface{}{
			name: map[string]interface{}{
				"credentials": map[string]string{"token": token},
				"sharedWith":  []string{"cisco-terraform"},
			},
		},
	}
	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(payload)
	req, err := http.NewRequest(http.MethodPost, "https://securitymgr-svc.securitymgr.svc:8989/api/config/addcredentials", payloadBuf)
	if err != nil {
		er := fmt.Errorf("error while building request to add credentials")
		return core.NewError(er, err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		er := fmt.Errorf("error while sending request to add credentials")
		return core.NewError(er, err)
	}
	b, err := httputil.DumpResponse(resp, true)
	log.Info(fmt.Sprintf("Response from AddCredentials %v", b))
	if err != nil {
		er := fmt.Errorf("error while parsing response from AddCredentials")
		return core.NewError(er, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		err := fmt.Errorf("error! Response content from AddCredentials: %s", string(b))
		return err
	}
	return nil
}

// Get credentials
func GetCredentials(ctx context.Context, name string) (string, bool, bool, error) {
	log := core.LoggerFromContext(ctx)
	log.Info("start querying credentials")
	configured := false
	tokenExist := false
	client := ConfigTLSClient()
	//TODO: query credential according to name
	payload := map[string]interface{}{
		"components": map[string]interface{}{
			name: map[string]string{},
		},
	}
	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(payload)
	req, err := http.NewRequest(http.MethodPost, "https://securitymgr-svc.securitymgr.svc:8989/api/config/getcredentials", payloadBuf)
	// var jsonData = []byte(`{"components": {"terraform":{}}}`)
	// req, err := http.NewRequest(http.MethodPost, "https://securitymgr-svc.securitymgr.svc:8989/api/config/getcredentials", bytes.NewBuffer(jsonData))
	if err != nil {
		er := fmt.Errorf("error while building request to get credentials")
		return "", configured, tokenExist, core.NewError(er, err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		er := fmt.Errorf("error while sending request to get credentials")
		return "", configured, tokenExist, core.NewError(er, err)
	}
	b, err := httputil.DumpResponse(resp, true)
	log.Info(fmt.Sprintf("Response from GetCredentials %v", b))
	if err != nil {
		er := fmt.Errorf("error while parsing response from GetCredentials")
		return "", configured, tokenExist, core.NewError(er, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		err := fmt.Errorf("error! Response content from GetCredentials: %s", string(b))
		return "", configured, tokenExist, err
	}
	credentials := Credentials{}
	err = json.NewDecoder(resp.Body).Decode(&credentials)
	if err != nil {
		er := fmt.Errorf("error while decoding credentials")
		return "", configured, tokenExist, core.NewError(er, err)
	}
	res := credentials.Response[0].Components.Terraform.Credentials
	if token, ok := res["token"]; ok {
		configured = true
		tokenStr := token.(string)
		if tokenStr != "" {
			tokenExist = true
		}
		return tokenStr, configured, tokenExist, nil
	} else {
		return "", configured, tokenExist, nil
	}
}

// Query credentials
func QueryCredentials() (string, error) {
	client := ConfigTLSClient()
	var jsonData = []byte(`{"components": {"terraform":{}}}`)
	req, err := http.NewRequest(http.MethodPost, "https://securitymgr-svc.securitymgr.svc:8989/api/config/getcredentials", bytes.NewBuffer(jsonData))
	if err != nil {
		er := fmt.Errorf("error while building request")
		return "", core.NewError(er, err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		er := fmt.Errorf("error after querying credentials")
		return "", core.NewError(er, err)
	}
	b, err := httputil.DumpResponse(resp, true)
	if err != nil {
		er := fmt.Errorf("error while dumping credentials response")
		return "", core.NewError(er, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		err := fmt.Errorf("error while querying credentials. Response content: %s", string(b))
		return "", err
	}
	credential := Credential{}
	err = json.NewDecoder(resp.Body).Decode(&credential)
	if err != nil {
		er := fmt.Errorf("error while decoding credential")
		return "", core.NewError(err, er)
	}
	token := credential.Response[0].Components.Terraform.Credentials.Token
	return token, nil
}

func CheckUserTokenExist() (bool, string, error) {
	exist, err := QueryCredentials()
	if err != nil {
		e := fmt.Errorf("credential from Querycredential " + exist)
		er := fmt.Errorf("error from QueryCredentials")
		return false, "", core.NewError(err, er, e)
	}
	if exist != "" {
		return true, exist, nil
	} else {
		err := fmt.Errorf("user Token required")
		return false, "", err
	}
}

func QueryAllOrgs(ctx context.Context, client *tfe.Client) ([]*tfe.Organization, error) {
	var res []*tfe.Organization
	orgs, err := client.Organizations.List(ctx, tfe.OrganizationListOptions{})
	if err != nil {
		er := fmt.Errorf("error while listing all orgs")
		return nil, core.NewError(er, err)
	}
	// filter orgs by entitlement
	for _, element := range orgs.Items {
		entitlements, ers := client.Organizations.Entitlements(ctx, element.Name)
		if ers != nil {
			er := fmt.Errorf("error while filter orgs by entitlement")
			return nil, core.NewError(er, ers)
		}
		if entitlements.Agents {
			res = append(res, element)
		}
	}
	return res, nil
}

func NewOrganization(org *tfe.Organization, newOrg terraformv1.Organization) error {
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
