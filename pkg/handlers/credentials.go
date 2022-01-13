package handlers

import (
	"context"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
)

func CredentialsHandler(ctx context.Context, event mo.Event) error {
	log := core.LoggerFromContext(ctx)
	log.Info("handling credentials", "resource", event.Resource())

	return nil
}
