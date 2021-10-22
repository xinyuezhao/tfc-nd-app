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

	"golang.cisco.com/examples/argome/gen/schema"
)

var testCtx = context.Background()

func TestRunner(t *testing.T) {
	t.Run("Handlers=1", testNodeManager)
	t.Run("FieldSelector=1", fieldSelectorTest)
	t.Run("TestLockable=1", testLockable)
}

func TestMain(m *testing.M) {
	fmt.Println("Starting testsuite: ", time.Now())
	testCtx = mo.ContextWithJSONSerde(testCtx, schema.Schema())
	if !waitForCondition(func() bool {
		r1, node := http.Get(nodemgrBaseURL)
		r2, cluster := http.Get(clustermgrBaseURL)
		if r1 != nil {
			r1.Body.Close()
		}
		if r2 != nil {
			r2.Body.Close()
		}
		var services []string
		if node == nil && cluster == nil {
			return true
		} else if node != nil {
			services = append(services, "nodemgr")
		} else if cluster != nil {
			services = append(services, "clustermgr")
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
