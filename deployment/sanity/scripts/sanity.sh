#!/usr/bin/env bash

timestamp() {
  date +"%T :" # current time
}

deploy() {
    echo "Deploying ARGO infrastructure services..."
    kind load docker-image mongo:4.4.4 --name argome-sanity-cluster
    kind load docker-image bitnami/kafka:2.7.0  --name argome-sanity-cluster
    kind load docker-image bitnami/zookeeper:3.7.0  --name argome-sanity-cluster
    kubectl apply -f deployment/sanity/infra.yaml

    echo "Waiting 10 seconds for initial infra setup..."
    sleep 10

    echo $(timestamp) "Deploying Argome..."
    kind load docker-image nodemgr:v1 --name argome-sanity-cluster
    kind load docker-image clustermgr:v1 --name argome-sanity-cluster
    kubectl apply -f deployment/sanity/argome.yaml

    echo "Waiting 10 seconds for argome setup..."
    sleep 10

    DEPLOYED="false"
    for i in {1..16}
        do
            CLUST=$(kubectl get pods --selector=service=clustermgr -n cisco-argome  -o jsonpath="{.items[*].status.phase}")
            NODEM=$(kubectl get pods --selector=service=nodemgr -n cisco-argome  -o jsonpath="{.items[*].status.phase}")
            ZOOKR=$(kubectl get pods --selector=argo.deploy=zoo -n argo-infra -o jsonpath="{.items[*].status.phase}")
            KAFKA=$(kubectl get pods --selector=argo.deploy=kafka -n argo-infra -o jsonpath="{.items[*].status.phase}")
            MONGO=$(kubectl get pods --selector=argo.deploy=mongo -n argo-infra -o jsonpath="{.items[*].status.phase}")
            if [[ -n $MONGO && -n $ZOOKR && -n $KAFKA ]]
            then
                if [[ $MONGO == "Running" && $ZOOKR == "Running"  && $KAFKA == "Running" && $CLUST == "Running" && $NODEM == "Running" ]]
                then
                    echo "Argome deployed"
                    DEPLOYED="true"
                    break
                else
                    echo "Argome platform booting..."
                    kubectl get pods -n argo-infra
                    kubectl get pods -n cisco-argome
                fi
            else
                echo "### Platform not running ###"
                kubectl get pods -n argo-infra
                kubectl get pods -n cisco-argome
            fi
            sleep 20
        done
    if [ $DEPLOYED == "true" ]
    then
        sleep 20
        kubectl get pods -n argo-infra
        kubectl get pods -n cisco-argome
        echo $(timestamp) "Deployment complete"
        return 1
    else
        echo $(timestamp) "Deployment failed"
        return 0
    fi
}

# Redeploy Argome
echo "Deploying argome ###"
if kubectl cluster-info --context kind-argome-sanity-cluster; then
    echo "Cluster exists. Redeploying argome afresh"
    kubectl delete --ignore-not-found deployment kafka -n argo-infra 
    kubectl delete --ignore-not-found deployment mongo -n argo-infra 
    kubectl delete --ignore-not-found deployment zookeeper -n argo-infra 
    kubectl delete --ignore-not-found deployment nodemgr -n cisco-argome
    kubectl delete --ignore-not-found deployment clustermgr -n cisco-argome 
    kubectl delete --ignore-not-found job argometester -n cisco-argome
else
    echo "No existing cluster. Creating a new cluster"
    kind create cluster --config deployment/sanity/cluster.yaml --name argome-sanity-cluster
fi

if deploy; then 
    exit 1
fi

# Deploy the tester job 
echo "### Deploying argome tester job ###"
kubectl delete --ignore-not-found -n cisco-argome job argometester
kind load docker-image argome-testsuite:v1 --name argome-sanity-cluster
kubectl apply -f deployment/sanity/sanity.yaml

# Wait for the tester job to be up and running
echo "Waiting for tester to setup..."
sleep 10
for i in {1..10}
    do
        TNAME=$(kubectl get pods --selector=argo.job=argometester -n cisco-argome -o jsonpath="{.items[*].metadata.name}")
        if [ -n $TNAME ]
        then
            break
        fi
        sleep 5
    done

# Exit if you cannot find the tester job pod after all this wait
if [ -z $TNAME ]
then
    echo "Error finding argometester job pod"
    exit 1
fi

# Setup a logfile to caputer the tester container logs
LOGFILE=$(mktemp -t argometester.log)
kubectl logs -f $TNAME -n cisco-argome | tee -a $LOGFILE
ln -sf $LOGFILE $TMPDIR/argometester-latest.log

# Monitor the status of the tester job
for i in {1..16}
    do
        ZOOKR=$(kubectl get pods --selector=argo.deploy=zoo -n argo-infra -o jsonpath="{.items[*].status.phase}")
        KAFKA=$(kubectl get pods --selector=argo.deploy=kafka -n argo-infra -o jsonpath="{.items[*].status.phase}")
        MONGO=$(kubectl get pods --selector=argo.deploy=mongo -n argo-infra -o jsonpath="{.items[*].status.phase}")
        TESTR=$(kubectl get pods --selector=argo.job=argometester -n cisco-argome -o jsonpath="{.items[*].status.phase}") 
        if [[ -n $MONGO && -n $ZOOKR && -n $KAFKA ]]
        then
            if [[ $MONGO == "Running" && $ZOOKR == "Running"  && $KAFKA == "Running" && $TESTR == "Running" ]]
            then
                echo "Argome test is running"
            else
                if [[ $TESTR == "Succeeded" ]]
                then
                    echo "Argome test succeeded"
                else
                    echo "Argome tester exited with " $TESTR
                fi
                break
            fi
        fi
        sleep 20
    done

# Dump the final state of the containers in all the namespaces
kubectl get pods -n argo-infra
kubectl get pods -n cisco-argome

# Show where the logfile is situated
echo "Logs stored under $LOGFILE"