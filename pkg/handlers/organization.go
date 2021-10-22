package handlers

import (
	"context"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
)

func OrganizationHandler(ctx context.Context, event mo.Event) error {
	log := core.LoggerFromContext(ctx)
	log.Info("handling organization", "resource", event.Resource())

	return nil
}