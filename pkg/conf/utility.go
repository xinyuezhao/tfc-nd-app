package conf

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"os"
	"sort"
	"strings"
	"sync"

	"github.com/hashicorp/go-tfe"
	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/terraform/gen/terraformv1"
)

// Create a new agentPool for an organization
func CreateAgentPool(ctx context.Context, client *tfe.Client, orgName, agentPoolName string) (*tfe.AgentPool, error) {
	createOptions := tfe.AgentPoolCreateOptions{Name: &agentPoolName}
	agentPool, err := client.AgentPools.Create(ctx, orgName, createOptions)
	if err != nil {
		er := fmt.Errorf("error from CreateAgentPool while creating agentpool")
		return nil, core.NewError(er, err)
	}
	return agentPool, nil
}

func QueryAgentPoolByID(ctx context.Context, client *tfe.Client, agentID string) (*tfe.AgentPool, error) {
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
func QueryAgentTokens(ctx context.Context, client *tfe.Client, agentPoolId string) ([]*tfe.AgentToken, error) {
	agentTokens, err := client.AgentTokens.List(ctx, agentPoolId)
	if err != nil {
		er := fmt.Errorf("error while listing agentTokens")
		return nil, core.NewError(er, err)
	}
	res := agentTokens.Items
	return res, nil
}

func QueryAgents(ctx context.Context, client *http.Client, agentPoolId string) ([]Agent, error) {
	log := core.LoggerFromContext(ctx)

	client.Transport = &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: false},
		Proxy:           http.ProxyFromEnvironment,
	}
	url := fmt.Sprintf("%s/%s/agents", AgentPoolURL, agentPoolId)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		errBuildQuery := fmt.Errorf("error while building request to query agents")
		return nil, core.NewError(errBuildQuery, err)
	}
	tokenExist, userToken, err := CheckUserTokenExist()
	if !tokenExist || err != nil {
		errTokenExist := fmt.Errorf("error from CheckUserTokenExist")
		return nil, core.NewError(errTokenExist, err)
	}
	auth := fmt.Sprintf("Bearer %s", userToken)
	req.Header.Set("Authorization", auth)
	resp, err := client.Do(req)
	if err != nil {
		errSendQuery := fmt.Errorf("error while sending request to query agents")
		return nil, core.NewError(errSendQuery, err)
	}
	defer resp.Body.Close()
	responseBody, err := httputil.DumpResponse(resp, true)
	log.Info("parsing response data")
	if err != nil {
		errParseQuery := fmt.Errorf("error while dumping response of querying agents")
		return nil, core.NewError(errParseQuery, err)
	}
	log.Info("response " + string(responseBody))
	if resp.StatusCode == 404 {
		// when it returns 404, whether usertoken doesn't have access to agentpool or the agentpool doesn't exist
		return nil, nil
	}
	if resp.StatusCode != 200 {
		err := core.NewError(fmt.Errorf("error while querying agents. Response content: %s", string(responseBody)))
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
		if agent.Attributes.Name == name && (agent.Attributes.Status == "idle" || agent.Attributes.Status == "busy" || agent.Attributes.Status == "unknown") {
			return agent.Id
		}
	}
	return ""
}

func QueryFeatures(ctx context.Context, client *http.Client) (Feature, error) {
	log := core.LoggerFromContext(ctx)
	result := Feature{}
	req, err := http.NewRequest(http.MethodGet, FeatureURL, nil)
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
	responseBody, err := httputil.DumpResponse(resp, true)
	log.Info("parsing response data")
	if err != nil {
		er := fmt.Errorf("error while dumping response of featureinstance")
		return result, core.NewError(er, err)
	}
	log.Info("response " + string(responseBody))
	if resp.StatusCode != 200 {
		err := core.NewError(fmt.Errorf("error while querying features. Response content: %s", string(responseBody)))
		return result, err
	}

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		er := fmt.Errorf("error while decoding feature")
		return result, core.NewError(er, err)
	}
	return result, nil
}

func ConfigTFC() (context.Context, *tfe.Client, error) {
	tokenExist, userToken, err := CheckUserTokenExist()
	if !tokenExist || err != nil {
		errQueryToken := core.NewError(err, fmt.Errorf("not able to get userToken"))
		return nil, nil, core.NewError(errQueryToken, err)
	}
	config := &tfe.Config{
		Token: userToken,
	}
	client, err := tfe.NewClient(config)
	if err != nil {
		errNewClient := fmt.Errorf("error from NewClient")
		return nil, nil, core.NewError(errNewClient, err)
	}
	// Create a context
	ctxTfe := context.Background()
	return ctxTfe, client, nil
}

func ConfigTLSClient() *http.Client {
	tr := &http.Transport{
		// TODO: insecure only needed against ND
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}
	return client
}

// Query agentPool by the name
func QueryAgentPoolByName(agentPools []*tfe.AgentPool, name string) (*tfe.AgentPool, error) {
	for _, agentPool := range agentPools {
		if agentPool.Name == name {
			return agentPool, nil
		}
	}
	return nil, fmt.Errorf(fmt.Sprintf("There is no agentPool named %v", name))
}

// Query all agentPools for an organization
func QueryAgentPools(ctx context.Context, client *tfe.Client, name string) ([]*tfe.AgentPool, error) {
	agentPools, err := client.AgentPools.List(ctx, name, &tfe.AgentPoolListOptions{})
	if err != nil {
		er := fmt.Errorf("error while listing agentpools")
		return nil, core.NewError(er, err)
	}
	res := agentPools.Items
	return res, nil
}

// Create a new agentToken
func CreateAgentToken(ctx context.Context, client *tfe.Client, agentPoolName, organization, desc string) (*tfe.AgentToken, string, error) {
	agentPools, _ := QueryAgentPools(ctx, client, organization)
	agentPool, queryErr := QueryAgentPoolByName(agentPools, agentPoolName)
	if queryErr != nil {
		er := fmt.Errorf("error from QueryAgentPoolByName while creating agentToken")
		return nil, "", core.NewError(er, queryErr)
	}
	agentToken, err := client.AgentTokens.Create(ctx, agentPool.ID, tfe.AgentTokenCreateOptions{Description: &desc})
	if err != nil {
		errCreateToken := fmt.Errorf("error while generating agentToken")
		return nil, "", core.NewError(errCreateToken, err)
	}
	return agentToken, agentPool.ID, nil
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
	req, err := http.NewRequest(http.MethodPost, FeatureDelURL, payloadBuf)
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

	tokenExist, userToken, err := CheckUserTokenExist()
	if !tokenExist || err != nil {
		er := fmt.Errorf("error from checkUserTokenExist while querying agent status")
		return "", core.NewError(er, err)
	}

	// query agents inside given agentpool
	log.Info("agent Id given " + agentId)

	client.Transport = &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: false},
		Proxy:           http.ProxyFromEnvironment,
	}
	url := fmt.Sprintf("%s/%s", AgentURL, agentId)
	log.Info("query url " + url)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		er := fmt.Errorf("error while building request to query agent status")
		return "", core.NewError(er, err)
	}

	// use user token to access terraform cloud API
	auth := fmt.Sprintf("Bearer %s", userToken)
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
func RemoveAgentPool(ctx context.Context, client *tfe.Client, agentPoolId string) error {
	err := client.AgentPools.Delete(ctx, agentPoolId)
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
	req, err := http.NewRequest(http.MethodPost, CredentialsAddURL, payloadBuf)
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
func GetCredentials(name string) (string, bool, bool, error) {
	configured := false
	tokenExist := false
	tokenStr := ""
	client := ConfigTLSClient()
	payload := map[string]interface{}{
		"components": map[string]interface{}{
			name: map[string]string{},
		},
	}
	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(payload)
	req, err := http.NewRequest(http.MethodPost, CredentialsURL, payloadBuf)
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
	if err != nil {
		er := fmt.Errorf("error while dumping response from GetCredentials")
		return "", configured, tokenExist, core.NewError(er, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		err := fmt.Errorf("error! Response content from GetCredentials: %s", string(b))
		return "", configured, tokenExist, err
	}
	resBody, _ := ioutil.ReadAll(resp.Body)
	respStr := string(resBody)
	resBytes := []byte(respStr)
	var jsonRes map[string]interface{}
	e := json.Unmarshal(resBytes, &jsonRes)
	if e != nil {
		fmt.Println("error while parsing response from GetCredentials")
	}
	response := jsonRes["response"].([]interface{})[0].(map[string]interface{})
	credentials := response["components"].(map[string]interface{})[name].(map[string]interface{})
	token := credentials["credentials"]
	if token != nil {
		configured = true
		tokenStr = token.(map[string]interface{})["token"].(string)
		if tokenStr != "" {
			tokenExist = true
		}
	}
	return tokenStr, configured, tokenExist, nil
}

func CheckUserTokenExist() (bool, string, error) {
	token, _, _, err := GetCredentials("terraform")
	if err != nil {
		e := fmt.Errorf("credential from GetCredentials " + token)
		er := fmt.Errorf("error from GetCredentials")
		return false, "", core.NewError(err, er, e)
	}
	if token != "" {
		return true, token, nil
	} else {
		err := fmt.Errorf("user Token required")
		return false, "", err
	}
}

func Entitlements(ctx context.Context, client *tfe.Client, element *tfe.Organization, c chan terraformv1.Organization, wg *sync.WaitGroup) {
	// log := core.LoggerFromContext(ctx)
	// log.Info("check entitlement for org TEST")
	// log.Info(fmt.Sprintf("check entitlement for org %v", element.Name))
	defer wg.Done()
	entitlements, errors := client.Organizations.ReadEntitlements(ctx, element.Name)
	if errors != nil {
		// log.Info(fmt.Sprintf("error while filter org %v by entitlement", element.Name))
		// log.Info(errors.Error())
		return
	}
	if entitlements.Agents {
		orgObject := terraformv1.OrganizationFactory()
		err := NewOrganization(element, orgObject)
		if err != nil {
			// log.Info(err.Error())
			// log.Info(fmt.Sprintf("error while NewOrganization %v", element.Name))
			return
		}
		c <- orgObject
		return
	}
}

func SortOrgs(organizations []terraformv1.Organization) []terraformv1.Organization {
	sort.Slice(organizations, func(i, j int) bool {
		return strings.Compare(organizations[i].Spec().Name(), organizations[j].Spec().Name()) <= 0
	})
	return organizations
}

func QueryAllOrgs(ctx context.Context, client *tfe.Client) ([]terraformv1.Organization, error) {
	// var res []*tfe.Organization
	orgs, err := client.Organizations.List(ctx, &tfe.OrganizationListOptions{})
	if err != nil {
		er := fmt.Errorf("error while listing all orgs")
		return nil, core.NewError(er, err)
	}
	// filter orgs by entitlement
	c := make(chan terraformv1.Organization, len(orgs.Items))
	var wg sync.WaitGroup
	organizationList := make([]terraformv1.Organization, 0)
	for _, element := range orgs.Items {
		wg.Add(1)
		go Entitlements(ctx, client, element, c, &wg)
	}
	wg.Wait()
	close(c)
	for item := range c {
		organizationList = append(organizationList, item)
	}
	return SortOrgs(organizationList), nil
}

func SetOrgUsage(org *tfe.Organization, newOrg terraformv1.Organization, c chan error, wg *sync.WaitGroup) {
	defer wg.Done()
	errors := make([]error, 0)
	usage, err := QueryOrgProperty(org, "usage")
	if err != nil {
		errQueryUsage := fmt.Errorf("error from QueryOrgProperty in func QueryOrgUsage")
		c <- core.NewError(err, errQueryUsage)
		return
	}
	errors = append(errors, newOrg.Spec().Usage().MutableOrganizationUsageV1Terraform().
		SetActiveAgentCount(ToFloat(usage["active-agent-count"])),
		newOrg.Spec().Usage().MutableOrganizationUsageV1Terraform().
			SetAdminUserCount(ToFloat(usage["admin-user-count"])),
		newOrg.Spec().Usage().MutableOrganizationUsageV1Terraform().
			SetAverageAppliesPerMonth(ToFloat(usage["average-applies-per-month"])),
		newOrg.Spec().Usage().MutableOrganizationUsageV1Terraform().
			SetConcurrencyLimitReached(ToFloat(usage["concurrency-limit-reached"])),
		newOrg.Spec().Usage().MutableOrganizationUsageV1Terraform().
			SetTotalApplies(ToFloat(usage["total-applies"])),
		newOrg.Spec().Usage().MutableOrganizationUsageV1Terraform().
			SetWorkspaceCount(ToFloat(usage["workspace-count"])))
	if err := core.NewError(errors...); err != nil {
		c <- err
		return
	}
}

func SetOrgSubscription(org *tfe.Organization, newOrg terraformv1.Organization, c chan error, wg *sync.WaitGroup) {
	defer wg.Done()
	errors := make([]error, 0)
	subscription, err := QueryOrgProperty(org, "subscription")
	if err != nil {
		errQuerySubscription := fmt.Errorf("error from QueryOrgProperty in func QueryOrgSubscription")
		c <- core.NewError(err, errQuerySubscription)
		return
	}
	errors = append(errors, newOrg.Spec().Subscription().MutableOrganizationSubscriptionV1Terraform().
		SetAgentsCeiling(ToFloat(subscription["agents-ceiling"])),
		newOrg.Spec().Subscription().MutableOrganizationSubscriptionV1Terraform().
			SetContractApplyLimit(ToFloat(subscription["contract-apply-limit"])),
		newOrg.Spec().Subscription().MutableOrganizationSubscriptionV1Terraform().
			SetContractUserLimit(ToFloat(subscription["contract-user-limit"])),
		newOrg.Spec().Subscription().MutableOrganizationSubscriptionV1Terraform().
			SetRunsCeiling(ToFloat(subscription["runs-ceiling"])))
	if err := core.NewError(errors...); err != nil {
		c <- err
		return
	}
}

func QueryOrgProperty(org *tfe.Organization, propertyName string) (map[string]interface{}, error) {
	client := ConfigTLSClient()
	client.Transport = &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: false},
		Proxy:           http.ProxyFromEnvironment,
	}
	usageUrl := fmt.Sprintf("%s/%s/%s", OrgURL, org.Name, propertyName)
	req, err := http.NewRequest(http.MethodGet, usageUrl, nil)
	if err != nil {
		err = fmt.Errorf("error while building request to query organization %v: %v", propertyName, err)
		return nil, err
	}
	tokenExist, userToken, err := CheckUserTokenExist()
	if !tokenExist || err != nil {
		errTokenExist := fmt.Errorf("error from CheckUserTokenExist")
		return nil, core.NewError(errTokenExist, err)
	}
	auth := fmt.Sprintf("Bearer %s", userToken)
	req.Header.Set("Authorization", auth)
	resp, err := client.Do(req)
	if err != nil {
		errSendQuery := fmt.Errorf("error while sending request to query organization %v", propertyName)
		return nil, core.NewError(errSendQuery, err)
	}
	defer resp.Body.Close()
	responseBody, err := httputil.DumpResponse(resp, true)
	if err != nil {
		errParseQuery := fmt.Errorf("error while dumping response of querying organization %v", propertyName)
		return nil, core.NewError(errParseQuery, err)
	}
	if resp.StatusCode != 200 {
		err := core.NewError(fmt.Errorf("error while querying organization %v. Response content: %s", propertyName, string(responseBody)))
		return nil, err
	}
	resBody, _ := ioutil.ReadAll(resp.Body)
	var jsonRes map[string]interface{}
	errUnmarshal := json.Unmarshal(resBody, &jsonRes)
	if errUnmarshal != nil {
		fmt.Println("error while parsing response from querying organization usage")
	}
	data := jsonRes["data"].(map[string]interface{})
	attributes := data["attributes"].(map[string]interface{})
	return attributes, nil
}

func ToFloat(item interface{}) float64 {
	if item == nil {
		return 0
	} else {
		return item.(float64)
	}
}

func NewOrganization(org *tfe.Organization, newOrg terraformv1.Organization) error {
	errors := make([]error, 0)
	c := make(chan error, 2)
	var wg sync.WaitGroup
	wg.Add(2)
	go SetOrgUsage(org, newOrg, c, &wg)
	go SetOrgSubscription(org, newOrg, c, &wg)
	wg.Wait()
	close(c)
	for item := range c {
		errors = append(errors, item)
	}
	errors = append(errors, newOrg.SpecMutable().SetName(org.Name),
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
			SetCanUpdateSentinel(org.Permissions.CanUpdateSentinel),
	)
	if err := core.NewError(errors...); err != nil {
		return err
	}
	return nil
}

// Method to configure the proxy environment variable
func ProxyConfig() error {
	configMap, err := GetProxyConfig()
	if err != nil {
		err = fmt.Errorf("error while getting proxy configuration: %v", err)
		return err
	}
	for configKey, configVal := range configMap {
		os.Setenv(configKey, configVal)
	}
	return nil
}

// Method to get proxy configuration
func GetProxyConfig() (map[string]string, error) {
	client := ConfigTLSClient()
	result := make(map[string]string)
	req, err := http.NewRequest(http.MethodGet, "https://confd.confd.svc:19999/api/config/class/cluster", nil)
	if err != nil {
		err = fmt.Errorf("error while building request to query proxy configuration: %v", err)
		return nil, err
	}
	resp, err := client.Do(req)
	if err != nil {
		err = fmt.Errorf("error after querying credentials: %v", err)
		return nil, err
	}
	body, err := httputil.DumpResponse(resp, true)
	if err != nil {
		err = fmt.Errorf("error while dumping response from proxy config query %v", err)
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		err := fmt.Errorf("error while querying proxy configuration. Response content: %s", string(body))
		return nil, err
	}
	resBody, _ := ioutil.ReadAll(resp.Body)
	var cluster_config []interface{}
	errUnmarshal := json.Unmarshal(resBody, &cluster_config)
	if errUnmarshal != nil {
		errUnmarshal = fmt.Errorf("error while parsing response from proxyConfig %v", errUnmarshal)
		return nil, errUnmarshal
	}
	if len(cluster_config) == 1 {
		config := cluster_config[0].(map[string]interface{})
		if proxy, ok := config["proxyConfig"]; ok {
			ignore_hosts := []string{"confd.confd.svc", "resourcemgr.kubese.svc", "securitymgr-svc.securitymgr.svc"}
			proxy := proxy.(map[string]interface{})
			if ignored, ok := proxy["ignoreHosts"]; ok {
				for _, ignore_host := range ignored.([]interface{}) {
					ignore_hosts = append(ignore_hosts, ignore_host.(string))
				}
			}
			result["no_proxy"] = strings.Join(ignore_hosts, ",")
			if servers, ok := proxy["servers"]; ok {
				for _, server := range servers.([]interface{}) {
					server_map := server.(map[string]interface{})
					proxy_string := server_map["proxyUrl"].(string)
					password := server_map["password"]
					username := server_map["username"]
					if password != "" && username != "" {
						proxy_split := strings.Split(proxy_string, "://")
						if len(proxy_split) == 2 {
							proxy_string = fmt.Sprintf("%v://%v:%v@%v", proxy_split[0], username, password, proxy_split[1])
						}
					}
					result[strings.ToLower(fmt.Sprintf("%v_PROXY", server_map["proxyType"]))] = proxy_string
				}
			}
		}
	}
	return result, nil
}

func StartAgent(ctx context.Context, restart bool, agent terraformv1.Agent) (terraformv1.Agent, error) {
	log := core.LoggerFromContext(ctx)
	var action string
	if restart {
		action = "restarting"
	} else {
		action = "starting"
	}
	agentPool := agent.Spec().Agentpool()
	org := agent.Spec().Organization()
	name := agent.Spec().Name()
	if agent.Spec().Token() == "" {
		log.Info(action + " agent without agent token")
		ctxTfe, client, err := ConfigTFC()
		if err != nil {
			er := fmt.Errorf("error from ConfigTFC while " + action + "agent")
			return nil, core.NewError(er, err)
		}
		agentToken, agentPoolID, err := CreateAgentToken(ctxTfe, client, agentPool, org, agent.Spec().Description())
		if err != nil {
			errCreateToken := fmt.Errorf("error from CreateAgentToken while " + action + "agent")
			return nil, core.NewError(errCreateToken, err)
		}

		if err := core.NewError(agent.SpecMutable().SetToken(agentToken.Token),
			agent.SpecMutable().SetTokenId(agentToken.ID),
			agent.SpecMutable().SetAgentpoolId(agentPoolID)); err != nil {
			return nil, err
		}
	}
	token := agent.Spec().Token()
	agent.SpecMutable().SetStatus("Initializing")
	// api call creating feature instance to deploy agent
	tlsClient := ConfigTLSClient()
	configMap, err := GetProxyConfig()
	if err != nil {
		er := fmt.Errorf("error while querying proxy configuration")
		return nil, core.NewError(er, err)
	}
	param := map[string]string{"token": token, "name": name, "http_proxy": configMap["http_proxy"], "https_proxy": configMap["https_proxy"]}
	body := map[string]interface{}{
		"vendor":           Vendor,
		"version":          Version,
		"app":              App,
		"featureName":      FeatureName,
		"instance":         name,
		"configParameters": param,
	}

	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(body)
	req, e := http.NewRequest(http.MethodPost, FeatureCreateURL, payloadBuf)
	if e != nil {
		er := fmt.Errorf("error while building createfeatureinstance request")
		return nil, core.NewError(er, e)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, errSendReq := tlsClient.Do(req)
	if errSendReq != nil {
		errReq := fmt.Errorf("error while making request to create feature instance")
		return nil, core.NewError(errReq, errSendReq)
	}
	defer resp.Body.Close()
	// parse resp.Body
	resBody, err := httputil.DumpResponse(resp, true)
	log.Info("parsing response data for " + action + " agent")
	if err != nil {
		errDump := fmt.Errorf("error while dumping response data for " + action + "agent")
		return nil, core.NewError(errDump, err)
	}
	if resp.StatusCode != 200 {
		err := core.NewError(fmt.Errorf("error while creating feature instance. Response content: %s", string(resBody)))
		return nil, err
	}
	return agent, nil
}

func RestartAgents(ctx context.Context, objs []mo.Object) error {
	for _, obj := range objs {
		agent := obj.(terraformv1.Agent)
		if agent.Spec().Status() == "Initializing" {
			agent, err := StartAgent(ctx, true, agent)
			if err != nil {
				errRestart := fmt.Errorf("error while restarting agent " + agent.Spec().Name())
				return core.NewError(err, errRestart)
			}
		}
	}
	return nil
}
