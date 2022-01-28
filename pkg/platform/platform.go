package platform

import (
	"golang.cisco.com/argo-galaxies/nexusdashboard"
	"golang.cisco.com/argo/pkg/config"
	"golang.cisco.com/argo/pkg/platform"
)

func New(platformName platform.Name, appName string, cs config.Store) platform.Infra {
	switch platformName {
	case platform.NexusDashboard:
		return nexusdashboard.New(appName, cs)
	}
	return nil
}
