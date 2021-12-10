//nolint: noctx
package main

import (
	"bytes"
	"net/http"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"
	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/mo"

	"golang.cisco.com/examples/terraform/gen/terraformv1"
)

var checkTaskStatus = func() bool {
	resp, err := http.Get(tasksURL)
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
	task, ok := objs[0].(terraformv1.Task)
	So(ok, ShouldBeTrue)
	if task.Status().Status() == false {
		return false
	}
	if len(task.Status().NodeList()) == 2 {
		return true
	}
	return false
}

func testLockable(t *testing.T) {
	Convey("Create a background task", t, func() {
		task := terraformv1.TaskFactory()
		err := task.SpecMutable().SetName("cluster-1")
		So(err, ShouldBeNil)

		doc, err := mo.JSONSerdeFromContext(testCtx).Marshal(mo.MarshalContextUnknown, task)
		So(err, ShouldBeNil)
		resp, err := http.Post(tasksURL, "application/json", bytes.NewReader(doc))
		So(err, ShouldBeNil)
		So(resp.StatusCode, ShouldEqual, http.StatusCreated)
		objs, err := readResponse(resp)
		So(err, ShouldBeNil)
		So(len(objs), ShouldEqual, 1)
	})

	Convey("Creating background task again should fail", t, func() {
		task := terraformv1.TaskFactory()
		err := task.SpecMutable().SetName("cluster-1")
		So(err, ShouldBeNil)

		doc, err := mo.JSONSerdeFromContext(testCtx).Marshal(mo.MarshalContextUnknown, task)
		So(err, ShouldBeNil)
		resp, err := http.Post(tasksURL, "application/json", bytes.NewReader(doc))
		So(err, ShouldBeNil)
		defer resp.Body.Close()
		So(resp.StatusCode, ShouldEqual, http.StatusBadRequest)
	})

	Convey("Check if Task status has been updated", t, func() {
		node := terraformv1.NodeFactory()
		So(core.NewError(node.SpecMutable().SetInbandIP("10.1.1.2"),
			node.SpecMutable().SetCluster("cluster-1"),
			node.SpecMutable().SetName("node-456")), ShouldBeNil)

		doc, err := mo.JSONSerdeFromContext(testCtx).Marshal(mo.MarshalContextUnknown, node)
		So(err, ShouldBeNil)
		resp, err := http.Post(nodesURL, "application/json", bytes.NewReader(doc))
		So(err, ShouldBeNil)
		So(resp.StatusCode, ShouldEqual, http.StatusCreated)
		objs, err := readResponse(resp)
		So(err, ShouldBeNil)
		So(len(objs), ShouldEqual, 1)
		So(waitForCondition(checkTaskStatus, time.Second*30), ShouldBeTrue)
	})

	Convey("Background task must be gone if task is deleted", t, func() {
		var resp *http.Response
		client := &http.Client{}
		req, err := http.NewRequest(http.MethodDelete, tasksURL+"/cluster-1", nil)
		So(err, ShouldBeNil)
		resp, err = client.Do(req)
		So(err, ShouldBeNil)
		defer resp.Body.Close()

		resp, err = http.Get(tasksURL)
		So(err, ShouldBeNil)
		objs, err := readResponse(resp)
		So(err, ShouldBeNil)
		So(len(objs), ShouldBeZeroValue)

		time.Sleep(30 * time.Second)
	})

	Convey("I should be able to create a new task again", t, func() {
		task := terraformv1.TaskFactory()
		err := task.SpecMutable().SetName("cluster-1")
		So(err, ShouldBeNil)

		doc, err := mo.JSONSerdeFromContext(testCtx).Marshal(mo.MarshalContextUnknown, task)
		So(err, ShouldBeNil)
		resp, err := http.Post(tasksURL, "application/json", bytes.NewReader(doc))
		So(err, ShouldBeNil)
		So(resp.StatusCode, ShouldEqual, http.StatusCreated)
		objs, err := readResponse(resp)
		So(err, ShouldBeNil)
		So(len(objs), ShouldEqual, 1)
		So(waitForCondition(checkTaskStatus, time.Second*30), ShouldBeTrue)
	})
}
