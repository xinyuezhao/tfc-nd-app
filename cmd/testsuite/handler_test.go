//nolint: noctx
package main

import (
	"net/http"
	"strings"
	"testing"
	"time"

	"golang.cisco.com/examples/argome/gen/argomev1"

	. "github.com/smartystreets/goconvey/convey"
)

func testNodeManager(t *testing.T) {
	Convey("Check if node manager is reachable",
		t, func(c C) {
			resp, err := http.Get(nodemgrBaseURL)
			So(err, ShouldBeNil)
			resp.Body.Close()
		})
	Convey("Check if cluster is reachable",
		t, func(c C) {
			resp, err := http.Get(clustermgrBaseURL)
			So(err, ShouldBeNil)
			resp.Body.Close()
		})
	Convey("Should be able to post a node object to node manager",
		t, func(c C) {
			node := `
{
  "spec": {
    "inbandIP": "10.1.1.1",
    "name": "node-123",
    "cluster": "cluster-1"
  }
}
`
			resp, err := http.Post(nodesURL, "application/json", strings.NewReader(node))
			So(err, ShouldBeNil)
			objs, err := readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
			nodeObj, ok := objs[0].(argomev1.Node)
			So(ok, ShouldBeTrue)
			So(nodeObj.Spec().InbandIP(), ShouldEqual, "10.1.1.1")
			resp.Body.Close()

			resp, err = http.Get(nodesURL)
			So(err, ShouldBeNil)
			objs, err = readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
			nodeObj, ok = objs[0].(argomev1.Node)
			So(ok, ShouldBeTrue)
			So(nodeObj.Spec().InbandIP(), ShouldEqual, "10.1.1.1")
			time.Sleep(time.Second * 2)
		})

	Convey("There should be a NodeOper object created for the node object and the node object should be pointing to it",
		t, func(c C) {
			So(waitForCondition(func() bool {
				resp, err := http.Get(nodesURL)
				if err != nil {
					return false
				}
				objs, err := readResponse(resp)
				if err != nil {
					return false
				}
				if len(objs) != 1 {
					return false
				}
				nodeOperObj, ok := objs[0].(argomev1.Node)
				if !ok {
					return false
				}
				if nodeOperObj.Status().InbandIP() != "10.1.1.1" {
					return false
				}
				if nodeOperObj.Status().Status() != "admitted" {
					return false
				}
				return true
			}, time.Second*10), ShouldBeTrue)

			resp, err := http.Get(nodesURL)
			So(err, ShouldBeNil)
			objs, err := readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
			nodeOperObj, ok := objs[0].(argomev1.Node)
			So(ok, ShouldBeTrue)
			So(nodeOperObj.Status().InbandIP(), ShouldEqual, "10.1.1.1")
			So(nodeOperObj.Status().Status(), ShouldEqual, "admitted")

			resp, err = http.Get(clusterMembersURL)
			So(err, ShouldBeNil)
			objs, err = readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
			cmObj, ok := objs[0].(argomev1.ClusterMember)
			So(ok, ShouldBeTrue)
			So(cmObj, ShouldNotBeNil)
		})
}
