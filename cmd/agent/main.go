package main

import (
	"context"
	"net/http"

	"github.com/hashicorp/go-tfe"
	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"

	"golang.cisco.com/examples/argome/gen/argomev1"
	"golang.cisco.com/examples/argome/gen/schema"
	"golang.cisco.com/examples/argome/pkg/handlers"
	"golang.cisco.com/examples/argome/pkg/platform"
)

func configTFC() (context.Context, *tfe.Client, error) {
	config := &tfe.Config{
		Token: "ai1yMKOzv3Mptg.atlasv1.lOseEHJzlB49Vz0fXTlFUFRGGTuugiP3040sr1MGGOkHgRqzQ9FrpiUJzyTH1DzzFTM",
	}
	client, err := tfe.NewClient(config)
	if err != nil {
		return nil, nil, err
	}
	// Create a context
	ctxTfe := context.Background()
	return ctxTfe, client, nil
}

// Query AgentTokens in an agentPool
func queryAgentTokens(ctx context.Context, client *tfe.Client, agentPlID string) ([]*tfe.AgentToken, error) {
	agentTokens, err := client.AgentTokens.List(ctx, agentPlID)
	if err != nil {
		return nil, err
	}
	res := agentTokens.Items
	return res, nil
}

func GETOverride(ctx context.Context, event *argomev1.TokenListDbReadEvent) (argomev1.TokenList, int, error) {
	payloadObject := event.Resource().(argomev1.TokenList)
	agentPlId := payloadObject.Spec().Agentpool()
	ctxTfe, client, err := configTFC()
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	tokens, err := queryAgentTokens(ctxTfe, client, agentPlId)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	result := argomev1.TokenListFactory()
	errs := make([]error, 0)
	for _, token := range tokens {
		errs = append(errs, result.SpecMutable().TokensAppendEl(token.ID))
	}
	errs = append(errs, result.SpecMutable().SetAgentpool(agentPlId))
	if err := core.NewError(errs...); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return result, http.StatusOK, nil
}

func GETAgentOverride(ctx context.Context, event *argomev1.AgentDbReadEvent) (argomev1.Agent, int, error) {
	desc := event.Resource().(argomev1.Agent).Spec().Description()
	obj, err := event.Store().ResolveByName(ctx, argomev1.AgentDNForDefault(desc))
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	payloadObject := obj.(argomev1.Agent)
	if err := core.NewError(payloadObject.Spec().MutableAgentSpecV1Argome().SetToken("********")); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return payloadObject, http.StatusOK, nil
}

func ListOverride(ctx context.Context, event *mo.TypeHandlerEvent) ([]argomev1.Agent, int, error) {
	objs := event.Resolver.ResolveByKind(ctx, argomev1.AgentMeta().MetaKey())
	result := make([]argomev1.Agent, 0)
	for _, obj := range objs {
		payloadObject := obj.(argomev1.Agent)
		if err := core.NewError(payloadObject.Spec().MutableAgentSpecV1Argome().SetToken("********")); err != nil {
			return nil, http.StatusInternalServerError, err
		}
		result = append(result, payloadObject)
	}
	return result, http.StatusOK, nil
}

func onStart(ctx context.Context, changer mo.Changer) error {
	log := core.LoggerFromContext(ctx)

	log.Info("agent service starts")

	return nil
}

func main() {
	handlerReg := []interface{}{
		handlers.AgentHandler,
		handlers.AgentValidator,
	}

	argomev1.TokenListMeta().RegisterAPIMethodGET(GETOverride)
	argomev1.AgentMeta().RegisterAPIMethodGET(GETAgentOverride)
	argomev1.AgentMeta().RegisterAPIMethodList(ListOverride)

	var apx service.Service
	var opts service.Options
	opts.PlatformFactory = platform.New
	apx = service.New("agent-manager", schema.Schema(), &opts)
	if apx == nil {
		panic("Could not create the service")
	}
	if err := apx.OnStart(onStart).
		Start(handlerReg...); err != nil {
		panic(err)
	}
}
