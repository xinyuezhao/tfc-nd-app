package main

const (
	nodemgrBaseURL    = "http://nodemgr:8089/"
	nodesURL          = nodemgrBaseURL + "api/argome.argo.cisco.com/v1/nodes"
	clustermgrBaseURL = "http://clustermgr:8090/"
	clusterMembersURL = clustermgrBaseURL + "api/argome.argo.cisco.com/v1/clustermembers"
	booksURL          = nodemgrBaseURL + "api/book.aci.cisco.com/v1/books"
	publishersURL     = nodemgrBaseURL + "api/book.aci.cisco.com/v1/publishers"
)
