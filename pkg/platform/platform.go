package platform

import (
	"golang.cisco.com/argo/pkg/config"
	"golang.cisco.com/argo/pkg/platformenv/intersight"
	"golang.cisco.com/argo/pkg/platformenv/kind"
	"golang.cisco.com/argo/pkg/platformenv/platform"
	"golang.cisco.com/argogalaxies/nexusdashboard"
)

func New(platformName platform.Name, appName string, cs config.Store) platform.Platform {
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
