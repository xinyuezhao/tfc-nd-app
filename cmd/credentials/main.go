package main

import (
	"context"
	"fmt"
	"net/http"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/service"
	"golang.cisco.com/terraform/gen/schema"
	"golang.cisco.com/terraform/gen/terraformv1"
	"golang.cisco.com/terraform/pkg/conf"
	"golang.cisco.com/terraform/pkg/handlers"
	"golang.cisco.com/terraform/pkg/platform"
)

func GETOverride(ctx context.Context, event *terraformv1.CredentialsDbReadEvent) (terraformv1.Credentials, int, error) {
	log := core.LoggerFromContext(ctx)
	log.Info("register overriding GET credentials")
	payloadObject := event.Resource().(terraformv1.Credentials)
	name := payloadObject.Spec().Name()
	_, configured, tokenExist, err := conf.GetCredentials(name)
	if err != nil {
		er := fmt.Errorf("error from GetCredentials")
		return nil, http.StatusInternalServerError, core.NewError(er, err)
	}
	result := terraformv1.CredentialsFactory()
	errors := make([]error, 0)
	errors = append(errors, result.SpecMutable().SetConfigured(configured),
		result.SpecMutable().SetTokenExist(tokenExist),
		result.SpecMutable().SetToken("***"),
		result.SpecMutable().SetName(name))
	if err := core.NewError(errors...); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return result, http.StatusOK, nil
}

func POSTOverride(ctx context.Context, event *terraformv1.CredentialsDbCreateEvent) (terraformv1.Credentials, int, error) {
	log := core.LoggerFromContext(ctx)
	log.Info("register overriding POST credentials")
	payloadObject := event.Resource().(terraformv1.Credentials)
	name := payloadObject.Spec().Name()
	token := payloadObject.Spec().Token()
	err := conf.AddCredentials(ctx, name, token)
	log.Info(fmt.Sprintf("Post credentials name %v, token %v", name, token))
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	result := terraformv1.CredentialsFactory()
	errors := make([]error, 0)
	tokenExist := false
	if token != "" {
		tokenExist = true
	}
	errors = append(errors, result.SpecMutable().SetName(name),
		result.SpecMutable().SetToken("***"),
		result.SpecMutable().SetConfigured(true),
		result.SpecMutable().SetTokenExist(tokenExist))
	if err := core.NewError(errors...); err != nil {
		return nil, http.StatusInternalServerError, err
	}
	log.Info(fmt.Sprintf("post credentials result name %v, token %v, configured %v, tokenExist %v", result.Spec().Name(), result.Spec().Token(), result.Spec().Configured(), result.Spec().TokenExist()))
	return result, http.StatusOK, nil
}

func onStart(ctx context.Context, changer mo.Changer) error {
	log := core.LoggerFromContext(ctx)

	log.Info("register overriding GET and POST during app start")
	return nil
}

func main() {
	// get proxy config by api and set it as env var
	if err := conf.ProxyConfig(); err != nil {
		panic(err)
	}

	handlerReg := []interface{}{
		handlers.CredentialsHandler,
	}

	terraformv1.CredentialsMeta().RegisterAPIMethodGET(GETOverride)
	terraformv1.CredentialsMeta().RegisterAPIMethodPOST(POSTOverride)

	var apx service.Service
	var opts service.Options
	opts.PlatformFactory = platform.New
	apx = service.New("credentials-manager", schema.Schema(), &opts)
	if apx == nil {
		panic("Could not create the service")
	}
	if err := apx.OnStart(onStart).
		Start(handlerReg...); err != nil {
		panic(err)
	}
}
