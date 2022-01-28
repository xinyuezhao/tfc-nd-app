package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestCredentialsCRUD(t *testing.T) {
	client := loginND(setupURL, username, password)
	Convey("Check if credentials manager is reachable",
		t, func(c C) {
			req, err := http.NewRequest(http.MethodGet, credentialsmgrBaseURL, nil)
			So(err, ShouldBeNil)
			_, resp, _ := client.Do(req)
			defer resp.Body.Close()
			So(resp.StatusCode, ShouldEqual, http.StatusOK)
		})
	Convey("Check if post credentials works",
		t, func(c C) {
			// post a credentials
			payload := map[string]interface{}{
				"spec": map[string]string{
					"name":  credentialsTest,
					"token": tokenTest,
				},
			}
			payloadBuf := new(bytes.Buffer)
			json.NewEncoder(payloadBuf).Encode(payload)
			reqPost, err := http.NewRequest(http.MethodPost, credentialsURL, payloadBuf)
			So(err, ShouldBeNil)
			obj, responsePost, err := client.Do(reqPost)
			So(err, ShouldBeNil)
			So(responsePost.StatusCode, ShouldEqual, http.StatusOK)
			log.Printf("credentials name is " + strings.Trim(obj.S("spec", "name").String(), "\""))
			So(strings.Trim(obj.S("spec", "name").String(), "\""), ShouldEqual, credentialsTest)
			log.Printf("credentials is configured: " + strings.Trim(obj.S("spec", "configured").String(), "\""))
			So(strings.Trim(obj.S("spec", "configured").String(), "\""), ShouldEqual, "true")
			log.Printf("credentials token exists: " + strings.Trim(obj.S("spec", "tokenExist").String(), "\""))
			So(strings.Trim(obj.S("spec", "tokenExist").String(), "\""), ShouldEqual, "true")
			log.Printf("credentials token is: " + strings.Trim(obj.S("spec", "token").String(), "\""))
			So(strings.Trim(obj.S("spec", "token").String(), "\""), ShouldEqual, tokenTest)
		})
	Convey("Check if query credentials work",
		t, func(c C) {
			reqGet, err := http.NewRequest(http.MethodGet, credentialsQueryURL, nil)
			So(err, ShouldBeNil)
			obj, responseGet, err := client.Do(reqGet)
			So(err, ShouldBeNil)
			So(responseGet.StatusCode, ShouldEqual, http.StatusOK)
			log.Printf("credentials name is " + strings.Trim(obj.S("spec", "name").String(), "\""))
			So(strings.Trim(obj.S("spec", "name").String(), "\""), ShouldEqual, credentialsTest)
			log.Printf("credentials is configured: " + strings.Trim(obj.S("spec", "configured").String(), "\""))
			So(strings.Trim(obj.S("spec", "configured").String(), "\""), ShouldEqual, "true")
			log.Printf("credentials token exists: " + strings.Trim(obj.S("spec", "tokenExist").String(), "\""))
			So(strings.Trim(obj.S("spec", "tokenExist").String(), "\""), ShouldEqual, "true")
			log.Printf("credentials token is: " + strings.Trim(obj.S("spec", "token").String(), "\""))
			// So(strings.Trim(obj.S("spec", "token").String(), "\""), ShouldEqual, tokenTest)
		})
	Convey("Check if update credentials work",
		t, func(c C) {
			// update credentials
			payload := map[string]interface{}{
				"spec": map[string]string{
					"name":  credentialsTest,
					"token": tokenUpdated,
				},
			}
			payloadBuf := new(bytes.Buffer)
			json.NewEncoder(payloadBuf).Encode(payload)
			reqPost, err := http.NewRequest(http.MethodPost, credentialsURL, payloadBuf)
			So(err, ShouldBeNil)
			obj, responsePost, err := client.Do(reqPost)
			So(err, ShouldBeNil)
			So(responsePost.StatusCode, ShouldEqual, http.StatusOK)
			log.Printf("credentials name is " + strings.Trim(obj.S("spec", "name").String(), "\""))
			So(strings.Trim(obj.S("spec", "name").String(), "\""), ShouldEqual, credentialsTest)
			log.Printf("credentials is configured: " + strings.Trim(obj.S("spec", "configured").String(), "\""))
			So(strings.Trim(obj.S("spec", "configured").String(), "\""), ShouldEqual, "true")
			log.Printf("credentials token exists: " + strings.Trim(obj.S("spec", "tokenExist").String(), "\""))
			So(strings.Trim(obj.S("spec", "tokenExist").String(), "\""), ShouldEqual, "true")
			log.Printf("credentials token is: " + strings.Trim(obj.S("spec", "token").String(), "\""))
			So(strings.Trim(obj.S("spec", "token").String(), "\""), ShouldEqual, tokenUpdated)

			// query to check whether updated
			reqGet, err := http.NewRequest(http.MethodGet, credentialsQueryURL, nil)
			So(err, ShouldBeNil)
			obj, responseGet, err := client.Do(reqGet)
			So(err, ShouldBeNil)
			So(responseGet.StatusCode, ShouldEqual, http.StatusOK)
			log.Printf("credentials name is " + strings.Trim(obj.S("spec", "name").String(), "\""))
			So(strings.Trim(obj.S("spec", "name").String(), "\""), ShouldEqual, credentialsTest)
			log.Printf("credentials is configured: " + strings.Trim(obj.S("spec", "configured").String(), "\""))
			So(strings.Trim(obj.S("spec", "configured").String(), "\""), ShouldEqual, "true")
			log.Printf("credentials token exists: " + strings.Trim(obj.S("spec", "tokenExist").String(), "\""))
			So(strings.Trim(obj.S("spec", "tokenExist").String(), "\""), ShouldEqual, "true")
			log.Printf("credentials token is: " + strings.Trim(obj.S("spec", "token").String(), "\""))
		})
}
