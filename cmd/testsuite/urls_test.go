package main

const (
	nodemgrBaseURL    = "http://nodemgr:8089/"
	nodesURL          = nodemgrBaseURL + "api/terraform.argo.cisco.com/v1/nodes"
	tasksURL          = nodemgrBaseURL + "api/terraform.argo.cisco.com/v1/tasks"
	clustermgrBaseURL = "http://clustermgr:8090/"
	clusterMembersURL = clustermgrBaseURL + "api/terraform.argo.cisco.com/v1/clustermembers"
	booksURL          = nodemgrBaseURL + "api/book.aci.cisco.com/v1/books"
	publishersURL     = nodemgrBaseURL + "api/book.aci.cisco.com/v1/publishers"
)
