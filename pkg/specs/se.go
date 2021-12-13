package specs

import (
	"golang.cisco.com/argo/pkg/fw"

	"golang.cisco.com/examples/terraform/gen/terraformv1"
)

const (
	nodeManagerTopic = "node-manager-topic"
)

// GenerateSESpec creates a SE app spec
func GenerateSESpec() (name string, ts []string, data []byte) {
	appName := "se"
	appPrefix := "sedge"
	organizationService := "organization-manager"
	organizationServiceTopic := "organization-manager-topic"
	organizationTopic := "organization-topic"
	organization := terraformv1.OrganizationFactory().Meta().Key()
	topics := []string{organizationServiceTopic}
	appDoc := `{
		"name": "` + appName + `",
		"prefix": "` + appPrefix + `",
		"resources": [
		{
			"name": "` + organization + `",
			"service": "` + organizationService + `",
			"endpoint": "` + organizationTopic + `"
		}
		],
		"services": [
		{
			"name": "` + organizationService + `",
			"endpoint": "` + organizationServiceTopic + `"
		}
		]
	}`
	return appName, topics, []byte(appDoc)
}

// CheckSEDirectory check the directory entires
func CheckSEDirectory(dir fw.Directory) bool {
	_, err := dir.Locator().Endpoint("organization-manager")
	return err == nil
}
