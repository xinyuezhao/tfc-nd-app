package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"golang.cisco.com/argo/pkg/mo"
)

func waitForCondition(fn func() bool, duration time.Duration) bool {
	ts := time.NewTimer(duration)
	backoff := func() {
		time.Sleep(duration / 10)
	}
	for {
		select {
		case <-ts.C:
			return false
		default:
			if fn() {
				return true
			}
			backoff()
		}
	}
}

func readResponse(resp *http.Response) ([]mo.Object, error) {
	serde := mo.JSONSerdeFromContext(testCtx)
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	fmt.Println(string(data))
	resp.Body.Close()
	return serde.Unmarshal(mo.UnmarshalContextUnknown, data)
}
