package main

import (
	"github.com/ciscoecosystem/mso-go-client/client"
)

const (
	username              = "admin"
	password              = "ins3965!"
	setupURL              = "https://172.31.187.83"
	credentialsTest       = "testName"
	tokenTest             = "testToken"
	tokenUpdated          = "updatedTestToken"
	credentialsmgrBaseURL = setupURL + "/sedgeapi/v1/cisco-terraform/credentialsmgr/"
	credentialsURL        = credentialsmgrBaseURL + "api/terraform.argo.cisco.com/v1/credentials"
	credentialsQueryURL   = credentialsURL + "/" + credentialsTest
)

func loginND(setupURL, userName, password string) *client.Client {
	clientND := client.GetClient(setupURL, userName, client.Password(password), client.Insecure(true), client.Platform("nd"))
	return clientND
}
