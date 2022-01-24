//nolint: noctx
package main

import (
	"net/http"
	"strings"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"golang.cisco.com/examples/terraform/gen/terraformv1"
)

func testCredentialsManager(t *testing.T) {
	Convey("Check if credentials manager is reachable",
		t, func(c C) {
			resp, err := http.Get(credentialsmgrBaseURL)
			So(err, ShouldBeNil)
			resp.Body.Close()
		})
	Convey("Check if post credentials works",
		t, func(c C) {
			credentials := `{"spec": {"name": "terraform", "token": "ai1yMKOzv3Mptg.atlasv1.lOseEHJzlB49Vz0fXTlFUFRGGTuugiP3040sr1MGGOkHgRqzQ9FrpiUJzyTH1DzzFTM"}}`
			resp, err := http.Post(credentialsURL, "application/json", strings.NewReader(credentials))
			So(err, ShouldBeNil)
			objs, err := readResponse(resp)
			So(err, ShouldBeNil)
			So(len(objs), ShouldEqual, 1)
			credentialsObj, ok := objs[0].(terraformv1.Credentials)
			So(ok, ShouldBeTrue)
			So(credentialsObj.Spec().Name(), ShouldEqual, "terraform")
			So(credentialsObj.Spec().Configured(), ShouldEqual, true)
			So(credentialsObj.Spec().TokenExist(), ShouldEqual, true)
			resp.Body.Close()
		})
	Convey("Check if query credentials work",
		t, func(c C) {
			resp, err := http.Get(credentialsTerraformURL)
			So(err, ShouldBeNil)
			obj, err := readResponse(resp)
			So(err, ShouldBeNil)
			So(len(obj), ShouldEqual, 1)
			credentialsObj, ok := obj[0].(terraformv1.Credentials)
			So(ok, ShouldBeTrue)
			So(credentialsObj.Spec().Name(), ShouldEqual, "terraform")
			So(credentialsObj.Spec().Configured(), ShouldEqual, true)
			So(credentialsObj.Spec().TokenExist(), ShouldEqual, true)
			resp.Body.Close()
		})
}
