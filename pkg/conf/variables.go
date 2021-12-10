package conf

const (
	Vendor      = "cisco"
	Version     = "0.0.2"
	App         = "terraform"
	FeatureName = "tfc-agent-feature"
	// Cookie      = "AuthCookie=eyJhbGciOiJSUzI1NiIsImtpZCI6ImE5dmV3eGprdDdxeWFvc2QydXdzaTI2eDFzdmFzNGp6IiwidHlwIjoiSldUIn0.eyJhdnBhaXIiOiJzaGVsbDpkb21haW5zPWFsbC9hZG1pbi8iLCJjbHVzdGVyIjoiNjI2NTJkNjMtNzI2NS03Mzc0LTJkNmUtNjQzMTJkMzAzMTAwIiwiZXhwIjoxNjM5MDMyMTk4LCJpYXQiOjE2MzkwMzA5OTgsImlkIjoiNDhkMTA1YmRmYmM0OWE1ZmNmMzlhMTBiOTYxMzg2ZTYxZGZlNDAwODVjYjAzMTVkODE4Yjc2MWM1NzM1ZGFmYSIsImlzcyI6Im5kIiwiaXNzLWhvc3QiOiIxMC4yMy4yNDguNjciLCJyYmFjIjpbeyJkb21haW4iOiJhbGwiLCJyb2xlcyI6W1siYWRtaW4iLCJXcml0ZVByaXYiXSxbImFwcC11c2VyIiwiUmVhZFByaXYiXV0sInJvbGVzUiI6MTY3NzcyMTYsInJvbGVzVyI6MX1dLCJzZXNzaW9uaWQiOiJXcDB0UG9zb3FFUjUzUFk5RFJNSFJoUkIiLCJ1c2VyZmxhZ3MiOjAsInVzZXJpZCI6MjUwMDIsInVzZXJuYW1lIjoiYWRtaW4iLCJ1c2VydHlwZSI6ImxvY2FsIn0.KWLM3svQmx0T3z8qXr_grzQ_OIwYB-Tmf4tSLCgQNxXySBsThEjbzv0HNq4yhzZS1w0PM4Rbg7XPRyYfnvqni5z-f9d2qLfCSLk4D7rSsZLbrnmJqO2sBdrpweG_-djVRRaMNsmgVldy5vixPlEcD-PMPVusO214AIBYpE7_pzcQRlR1LMlC-32ybLLg_O3N3_UqRrnIbj4jr6Ogcf5jGKZcm-BhbHX_lHszHbHR9G3LMQE2isxv3TyZje_7H7SNdVYh0enCt_4bT8FgsSf_uZc1ASA_6YMaOmXSoNSe44RgMuDT0jtVmlVVMhkdOqkXwmIE-CtXO4eujowEARKoPA"
	// Usertoken = "ai1yMKOzv3Mptg.atlasv1.lOseEHJzlB49Vz0fXTlFUFRGGTuugiP3040sr1MGGOkHgRqzQ9FrpiUJzyTH1DzzFTM"
)

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
