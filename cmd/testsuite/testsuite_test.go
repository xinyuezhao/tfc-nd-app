//nolint: noctx
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"

	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/examples/terraform/gen/schema"
)

var testCtx = context.Background()

func TestRunner(t *testing.T) {
	t.Run("Handlers=1", testCredentialsManager)
}

func TestMain(m *testing.M) {
	fmt.Println("Starting testsuite: ", time.Now())
	testCtx = mo.ContextWithJSONSerde(testCtx, schema.Schema())
	if !waitForCondition(func() bool {
		r1, credentials := http.Get(credentialsmgrBaseURL)
		if r1 != nil {
			r1.Body.Close()
		}
		var services []string
		if credentials == nil {
			return true
		} else if credentials != nil {
			services = append(services, "credentialsmgr")
		}
		fmt.Println("Waiting for Services: ", services)
		return false
	}, 60*time.Second) {
		fmt.Println("Services did not come up")
		os.Exit(1)
	}
	fmt.Println("Running testsuite: ", time.Now())
	ret := m.Run()
	os.Exit(ret)
}
