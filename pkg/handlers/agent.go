package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httputil"
	"time"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/model"
	"golang.cisco.com/examples/terraform/gen/terraformv1"
	"golang.cisco.com/examples/terraform/pkg/conf"
)

func AgentHandler(ctx context.Context, event mo.Event) error {
	log := core.LoggerFromContext(ctx)
	log.Info("handling Agent", "resource", event.Resource())
	agent := event.Resource().(terraformv1.Agent)
	agentPl := agent.Spec().Agentpool()
	org := agent.Spec().Organization()
	name := agent.Spec().Name()
	if event.Operation() == model.CREATE {
		if agent.Spec().Token() == "" {
			log.Info("create agent without agent token")
			ctxTfe, client, err := conf.ConfigTFC()
			if err != nil {
				er := fmt.Errorf("error from ConfigTFC when creating agent")
				return core.NewError(er, err)
			}
			agentToken, agentPlID, err := conf.CreateAgentToken(ctxTfe, client, agentPl, org, agent.Spec().Description())
			if err != nil {
				er := fmt.Errorf("error from CreateAgentToken")
				return core.NewError(er, err)
			}
			log.Info("description for agent token generated: " + agentToken.Description)
			log.Info("agentPlID generated: " + agentPlID)
			log.Info("agent token generated " + agentToken.Token)

			if err := core.NewError(agent.SpecMutable().SetToken(agentToken.Token),
				agent.SpecMutable().SetTokenId(agentToken.ID),
				agent.SpecMutable().SetAgentpoolId(agentPlID)); err != nil {
				return err
			}
		}
		token := agent.Spec().Token()
		agent.SpecMutable().SetStatus("Created")
		// api call creating feature instance to deploy agent
		TLSclient := conf.ConfigTLSClient()
		configMap, err := conf.GetProxyConfig()
		if err != nil {
			er := fmt.Errorf("error while querying proxy configuration")
			return core.NewError(er, err)
		}
		param := map[string]string{"token": token, "name": name, "http_proxy": configMap["http_proxy"], "https_proxy": configMap["https_proxy"]}
		body := map[string]interface{}{
			"vendor":           conf.Vendor,
			"version":          conf.Version,
			"app":              conf.App,
			"featureName":      conf.FeatureName,
			"instance":         name,
			"configParameters": param,
		}

		payloadBuf := new(bytes.Buffer)
		json.NewEncoder(payloadBuf).Encode(body)
		req, e := http.NewRequest(http.MethodPost, "https://resourcemgr.kubese.svc/api/config/createfeatureinstance", payloadBuf)
		if e != nil {
			er := fmt.Errorf("error while building createfeatureinstance request")
			return core.NewError(er, e)
		}
		req.Header.Set("Content-Type", "application/json")
		log.Info("before request post")
		resp, e := TLSclient.Do(req)
		log.Info("after request post")
		if e != nil {
			er := fmt.Errorf("error while making request to create feature instance")
			return core.NewError(er, e)
		}
		log.Info("err after request post")
		defer resp.Body.Close()
		// parse resp.Body
		b, err := httputil.DumpResponse(resp, true)
		log.Info("parsing response data")
		if err != nil {
			er := fmt.Errorf("error while dumping response data")
			return core.NewError(er, err)
		}
		log.Info("after parse response data")
		log.Info("response " + string(b))
		log.Info("respose status " + resp.Status)
		if resp.StatusCode != 200 {
			err := core.NewError(fmt.Errorf("error while creating feature instance. Response content: %s", string(b)))
			return err
		}

		if err := event.Store().Record(ctx, agent); err != nil {
			core.LoggerFromContext(ctx).Error(err, "failed to record Agent")
			return err
		}
		if err := event.Store().Commit(ctx); err != nil {
			core.LoggerFromContext(ctx).Error(err, "failed to commit Agent")
			return err
		}
	}

	if event.Operation() == model.DELETE {
		tokenID := agent.Spec().TokenId()
		// delete feature instance to stop the agent
		TLSclient := conf.ConfigTLSClient()
		log.Info("before delete agent feature instance")
		err := conf.DelFeatureInstance(ctx, TLSclient, name)
		if err != nil {
			er := fmt.Errorf("error from DelFeatureInstance")
			return core.NewError(er, err)
		}
		log.Info("after deleting feature instance")
		log.Info("remove agentToken")
		time.Sleep(10 * time.Second)
		if tokenID != "" {
			ctxTfe, client, err := conf.ConfigTFC()
			if err != nil {
				er := fmt.Errorf("error from ConfigTFC while deleting agent")
				return core.NewError(er, err)
			}
			removeErr := conf.RemoveAgentToken(ctxTfe, client, tokenID)
			if removeErr != nil {
				er := fmt.Errorf("error from RemoveAgentToken")
				return core.NewError(er, removeErr)
			}
		}
		log.Info("after removing agentToken")
	}
	return nil
}

func AgentValidator(ctx context.Context, event mo.Validation) error {
	log := core.LoggerFromContext(ctx)
	// TODO:event.Operation() description requied only if agent without token
	log.Info("validate Agent", "resource", event.Resource())
	agent := event.Resource().(terraformv1.Agent)
	desc := agent.Spec().Description()
	name := agent.Spec().Name()
	empty := ""
	if name == "" {
		empty = "name"
	}
	if desc == "" {
		empty = "description"
	}
	if empty != "" {
		err := core.NewError(fmt.Errorf("Agent %s can't be blank", empty))
		return err
	}
	return nil
}
