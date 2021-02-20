package main

import (
	"context"
	"fmt"
	"time"

	"github.com/pkg/errors"
	"golang.cisco.com/argo/pkg/fw"
	"golang.cisco.com/argo/pkg/kafka"
)

func waitForKafkaTopics(admin kafka.Admin, topics ...string) error {
	for _, topic := range topics {
		cnt := 0
		for {
			if exists, err := admin.Topic(topic); exists && err == nil {
				break
			}
			time.Sleep(time.Second * 1)
			cnt++
			if cnt > defaultTopicWait {
				return errors.New(topic + " topic was not created")
			}
		}
	}
	return nil
}

func kafkaIsRunning(ctx context.Context, cfg *kafka.Config) bool {
	broker, err := kafka.CreateBroker(ctx, cfg)
	if err == nil {
		defer broker.Close()
		if ok, err := broker.Connected(); err == nil && ok {
			return true
		}
	}
	return false
}

// waitForKafka waits for kafka container to ba alive
func waitForKafka(ctx context.Context, cfg *kafka.Config) error {
	for i := 0; i < 10; i++ {
		if kafkaIsRunning(ctx, cfg) {
			return nil
		}
		time.Sleep(defaultWaitOnKafka * time.Second)
	}
	return errors.New("unable to connect to " + cfg.BrokerAddrs[0])
}

func createAdmin(ctx context.Context, cfg *kafka.Config) (kafka.Admin, error) {
	//nolint: gomnd
	ts := time.NewTimer(time.Second * 60)
	for {
		select {
		case <-ts.C:
			return nil, errors.New("admin creation timed out")
		default:
			admin, err := kafka.NewAdmin(ctx, cfg)
			if err == nil {
				return admin, err
			}
			//nolint: gomnd
			time.Sleep(time.Millisecond * 500)
		}
	}
}

// setupKafkaTopics creates topics in kafka
func setupKafkaTopics(ctx context.Context, topics ...string) error {
	var admin kafka.Admin

	defer func() {
		if admin != nil {
			_ = admin.Close()
		}
	}()

	cfg := &kafka.Config{
		BrokerAddrs: []string{"kafka:9092"},
		KeyFile:     "/security/client.key.pem",
		CertFile:    "/security/client.cer.pem",
		CaCertFile:  "/security/server.cer.pem",
		Secure:      true,
	}

	fmt.Println("Waiting for kafka")
	if err := waitForKafka(ctx, cfg); err != nil {
		fmt.Println("Waiting for kafka failed")
		return err
	}
	fmt.Println("Waited successfully")
	admin, err := createAdmin(ctx, cfg)
	if err != nil {
		return err
	}
	fmt.Println("Admin created")
	for _, topic := range topics {
		if exists, errx := admin.Topic(topic); exists && errx == nil {
			continue
		}
		err = admin.CreateTopic(topic)
		if err != nil {
			return err
		}
	}
	fmt.Println("Topics created")
	return waitForKafkaTopics(admin, topics...)
}

func setupTopics(ctx context.Context, topics ...string) error {
	topics = append(topics, fw.ArgoSpecifications)
	return setupKafkaTopics(ctx, topics...)
}
