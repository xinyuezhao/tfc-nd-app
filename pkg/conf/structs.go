package conf

type Feature struct {
	Instances []struct {
		Features []struct {
			Name             string
			Instance         string
			OperState        string
			ConfigParameters struct {
				Name  string
				Token string
			}
		}
	}
}

type Agents struct {
	Data []Agent
}

type Agent struct {
	Id         string
	Attributes struct {
		Name    string
		Status  string
		Version string
	}
}

type AgentStatus struct {
	Data Agent
}

type Credential struct {
	Response []struct {
		Components struct {
			Terraform struct {
				Credentials struct {
					Token string
				}
			}
		}
	}
}

type Credentials struct {
	Response []struct {
		Components struct {
			Terraform struct {
				Credentials map[string]interface{}
			}
		}
	}
}
