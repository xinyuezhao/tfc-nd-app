package main

import (
	"context"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/fw"

	"golang.cisco.com/examples/argome/pkg/specs"
)

func getAppDoc() (ts []string, data map[string][]byte) {
	ret := make(map[string][]byte)
	topics := []string{}

	name, ts, doc := specs.GenerateSESpec()
	ret[name] = doc
	topics = append(topics, ts...)

	return topics, ret
}

func sendAppDocs(ctx context.Context, docs map[string][]byte) error {
	trans := fw.Transporter(ctx)
	for _, doc := range docs {
		core.LoggerFromContext(ctx).Info("Publishing app specification", "Specification", string(doc))
		err := trans.Send(ctx, fw.ArgoSpecifications, "test", doc, nil)
		if err != nil {
			return err
		}
	}
	return nil
}

func consumeSpecifications(ctx context.Context) bool {
	trans := fw.Transporter(ctx)
	return specs.CheckSEDirectory(trans.Directory())
}
