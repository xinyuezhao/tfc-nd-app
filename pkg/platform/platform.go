package platform

import (
	"golang.cisco.com/argo-galaxies/intersight"
	"golang.cisco.com/argo-galaxies/nexusdashboard"
	"golang.cisco.com/argo/pkg/config"
	"golang.cisco.com/argo/pkg/platform"
	"golang.cisco.com/argo/pkg/platformenv/kind"
)

func New(platformName platform.Name, appName string, cs config.Store) platform.Infra {
	switch platformName {
	case platform.Kind:
		return kind.New(appName, cs)
	case platform.NexusDashboard:
		return nexusdashboard.New(appName, cs)
	case platform.Intersight:
		return intersight.New(appName, cs)
	}
	return nil
}
