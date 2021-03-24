package specs

import (
	"golang.cisco.com/argo/pkg/fw"

	"golang.cisco.com/examples/argome/gen/argomev1"
)

const (
	nodeManagerTopic = "node-manager-topic"
)

// GenerateSESpec creates a SE app spec
func GenerateSESpec() (name string, ts []string, data []byte) {
	appName := "se"
	appPrefix := "sedge"
	nodeService := "node-manager"
	nodeServiceTopic := nodeManagerTopic
	clusterService := "clusterd"
	clusterServiceTopic := "clusterd-topic"
	node := argomev1.NodeFactory().Meta().Key()
	nodeTopic := "node-topic"
	cluster := argomev1.ClusterFactory().Meta().Key()
	clusterTopic := "cluster-topic"
	clusterMember := argomev1.ClusterMemberFactory().Meta().Key()
	topics := []string{nodeServiceTopic, clusterServiceTopic, nodeTopic, clusterTopic}
	appDoc := `{
		"name": "` + appName + `",
		"prefix": "` + appPrefix + `",
		"resources": [
		{
			"name": "` + node + `",
			"service": "` + nodeService + `",
			"endpoint": "` + nodeTopic + `"
		},
		{
			"name": "` + cluster + `",
			"service": "` + clusterService + `",
			"endpoint": "` + clusterTopic + `"
		},
		{
			"name": "` + clusterMember + `",
			"service": "` + clusterService + `",
			"endpoint": "` + clusterTopic + `"
		}
		],
		"services": [
			{
			"name": "` + nodeService + `",
			"endpoint": "` + nodeServiceTopic + `"
		},
		{
			"name": "` + clusterService + `",
			"endpoint": "` + clusterServiceTopic + `"
		}
		]
	}`
	return appName, topics, []byte(appDoc)
}

// CheckSEDirectory check the directory entires
func CheckSEDirectory(dir fw.Directory) bool {
	_, err := dir.Locator().Endpoint("node-manager")
	return err == nil
}
