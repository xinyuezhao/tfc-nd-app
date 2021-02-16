//nolint: noctx
package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"golang.cisco.com/argo/pkg/mo"
	"golang.cisco.com/argo/pkg/utils"

	"golang.cisco.com/examples/argome/gen/argomev1"
	"golang.cisco.com/examples/argome/gen/schema"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testCtx = context.Background()
)

func readResponse(resp *http.Response) ([]mo.Object, error) {
	serde := mo.JSONSerdeFromContext(testCtx)
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	fmt.Println(string(data))
	resp.Body.Close()
	return serde.Unmarshal(data)
}

func TestNodeManager(t *testing.T) {
	Convey("Check if node manager is reachable",
		t, func(c C) {
			resp, err := http.Get("http://node-manager:8089/")
			So(err, ShouldBeNil)
			resp.Body.Close()
		})
	Convey("Check if cluster is reachable",
		t, func(c C) {
			resp, err := http.Get("http://cluster:8089/")
			So(err, ShouldBeNil)
			resp.Body.Close()
		})
	Convey("Should be able to post a node object to node manager",
		t, func(c C) {
			node := `{
				"inbandIP": "10.1.1.1",
				"name": "node-123",
				"cluster": "/argome.argo.cisco.com/v1/clusters/cluster-1" 
			}`
			resp, err := http.Post("http://node-manager:8089/api/argome.argo.cisco.com/v1/nodes", "application/json", strings.NewReader(node))
			So(err, ShouldBeNil)
			objs, err := readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
			nodeObj, ok := objs[0].(argomev1.Node)
			So(ok, ShouldBeTrue)
			So(nodeObj.InbandIP(), ShouldEqual, "10.1.1.1")
			resp.Body.Close()

			resp, err = http.Get("http://node-manager:8089/api/argome.argo.cisco.com/v1/nodes")
			So(err, ShouldBeNil)
			objs, err = readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
			nodeObj, ok = objs[0].(argomev1.Node)
			So(ok, ShouldBeTrue)
			So(nodeObj.InbandIP(), ShouldEqual, "10.1.1.1")
			time.Sleep(time.Second * 2)
		})
	Convey("There should be a NodeOper object created for the node object and the node object should be pointing to it",
		t, func(c C) {
			resp, err := http.Get("http://node-manager:8089/api/argome.argo.cisco.com/v1/nodeOpers")
			So(err, ShouldBeNil)
			objs, err := readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
			nodeOperObj, ok := objs[0].(argomev1.NodeOper)
			So(ok, ShouldBeTrue)
			So(nodeOperObj.InbandIP(), ShouldEqual, "10.1.1.1")
			So(nodeOperObj.Status(), ShouldEqual, "admitted")
			nodeOperObjName, err := utils.AnyMetaName(nodeOperObj)
			So(err, ShouldBeNil)

			resp, err = http.Get("http://node-manager:8089/api/argome.argo.cisco.com/v1/nodes")
			So(err, ShouldBeNil)
			objs, err = readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
			nodeObj, ok := objs[0].(argomev1.Node)
			So(ok, ShouldBeTrue)
			So(nodeObj.Oper(), ShouldEqual, nodeOperObjName)

			resp, err = http.Get("http://cluster:8089/api/argome.argo.cisco.com/v1/clustermembers")
			So(err, ShouldBeNil)
			objs, err = readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
			cmObj, ok := objs[0].(argomev1.ClusterMember)
			So(ok, ShouldBeTrue)
			So(cmObj, ShouldNotBeNil)
		})
}

func TestMain(m *testing.M) {
	testCtx = mo.ContextWithJSONSerde(testCtx, schema.Schema())
	time.Sleep(time.Second * 10)
	os.Exit(m.Run())
}
