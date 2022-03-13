package conf

const (
	Vendor            = "cisco"
	Version           = "0.1.5"
	App               = "terraform"
	FeatureName       = "tfc-agent"
	AgentPoolURL      = "https://app.terraform.io/api/v2/agent-pools"
	FeatureURL        = "https://resourcemgr.kubese.svc/api/config/dn/appinstances/cisco-terraform"
	FeatureDelURL     = "https://resourcemgr.kubese.svc/api/config/delfeatureinstance"
	AgentURL          = "https://app.terraform.io/api/v2/agents"
	CredentialsURL    = "https://securitymgr-svc.securitymgr.svc:8989/api/config/getcredentials"
	FeatureCreateURL  = "https://resourcemgr.kubese.svc/api/config/createfeatureinstance"
	CredentialsAddURL = "https://securitymgr-svc.securitymgr.svc:8989/api/config/addcredentials"
	OrgURL            = "https://app.terraform.io/api/v2/organizations"
)
