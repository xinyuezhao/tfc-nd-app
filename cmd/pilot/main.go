package main

import (
	"fmt"
	"os"
	"time"

	"golang.cisco.com/argo/pkg/core"
	"golang.cisco.com/argo/pkg/service"

	"golang.cisco.com/examples/argome/gen/schema"
	"golang.cisco.com/examples/argome/pkg/handshake"
)

const (
	defaultWaitOnKafka = 5
	defaultWaitTime    = 5
	defaultTopicWait   = 10
)

// isContainerizedRun returns if this is a containerized test run
func isContainerizedRun() bool {
	return os.Getenv("ARGO_CONTAINERIZED_RUN") == "true"
}

func main() {
	handshake.Clear()
	topics, docs := getAppDoc()
	for _, doc := range docs {
		fmt.Println("DOCS:", string(doc))
	}
	apx := service.New("pilot", schema.Schema(), NewLogger())
	if apx == nil {
		panic("Could not create the service")
	}
	go func() {
		err := apx.Start()
		if err != nil {
			panic(err)
		}
	}()
	//nolint:gomnd
	time.Sleep(time.Second * 10)
	logger := core.LoggerFromContext(apx.Context())
	logger.Info("Created directory topic")
	if err := setupTopics(apx.Context(), topics...); err != nil {
		if isContainerizedRun() {
			panic(err.Error() + ":" + "failed to create topics")
		}
	}
	logger.Info("Created app topics")
	err := sendAppDocs(apx.Context(), docs)
	if err != nil {
		panic(err)
	}
	time.Sleep(time.Second * defaultWaitTime)
	logger.Info("Consume the specifications for confirmation")
	if !consumeSpecifications(apx.Context()) {
		panic(err)
	}
	handshake.Set()
	logger.Info("Pilot exiting")
}
