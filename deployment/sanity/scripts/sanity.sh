#!/usr/bin/env bash

timestamp() {
  date +"%T :" # current time
}

deploy() {
    echo "Deploying ARGO infrastructure services..."
    kind load docker-image mongo:4.4.4 --name terraform-sanity-cluster
    kind load docker-image bitnami/kafka:2.7.0  --name terraform-sanity-cluster
    kind load docker-image bitnami/zookeeper:3.7.0  --name terraform-sanity-cluster
    kubectl apply -f deployment/sanity/infra.yaml

    echo "Waiting 10 seconds for initial infra setup..."
    sleep 10

    echo $(timestamp) "Deploying terraform..."
    kind load docker-image nodemgr:v1 --name terraform-sanity-cluster
    kind load docker-image clustermgr:v1 --name terraform-sanity-cluster
    kubectl apply -f deployment/sanity/terraform.yaml

    echo "Waiting 10 seconds for terraform setup..."
    sleep 10

    DEPLOYED="false"
    for i in {1..16}
        do
            CLUST=$(kubectl get pods --selector=service=clustermgr -n cisco-terraform  -o jsonpath="{.items[*].status.phase}")
            NODEM=$(kubectl get pods --selector=service=nodemgr -n cisco-terraform  -o jsonpath="{.items[*].status.phase}")
            ZOOKR=$(kubectl get pods --selector=argo.deploy=zoo -n argo-infra -o jsonpath="{.items[*].status.phase}")
            KAFKA=$(kubectl get pods --selector=argo.deploy=kafka -n argo-infra -o jsonpath="{.items[*].status.phase}")
            MONGO=$(kubectl get pods --selector=argo.deploy=mongo -n argo-infra -o jsonpath="{.items[*].status.phase}")
            if [[ -n $MONGO && -n $ZOOKR && -n $KAFKA ]]
            then
                if [[ $MONGO == "Running" && $ZOOKR == "Running"  && $KAFKA == "Running" && $CLUST == "Running" && $NODEM == "Running" ]]
                then
                    echo "terraform deployed"
                    DEPLOYED="true"
                    break
                else
                    echo "terraform platform booting..."
                    kubectl get pods -n argo-infra
                    kubectl get pods -n cisco-terraform
                fi
            else
                echo "### Platform not running ###"
                kubectl get pods -n argo-infra
                kubectl get pods -n cisco-terraform
            fi
            sleep 20
        done
    if [ $DEPLOYED == "true" ]
    then
        sleep 20
        kubectl get pods -n argo-infra
        kubectl get pods -n cisco-terraform
        echo $(timestamp) "Deployment complete"
        return 1
    else
        echo $(timestamp) "Deployment failed"
        return 0
    fi
}

# Redeploy terraform
echo "Deploying terraform ###"
if kubectl cluster-info --context kind-terraform-sanity-cluster; then
    echo "Cluster exists. Redeploying terraform afresh"
    kubectl delete --ignore-not-found deployment kafka -n argo-infra 
    kubectl delete --ignore-not-found deployment mongo -n argo-infra 
    kubectl delete --ignore-not-found deployment zookeeper -n argo-infra 
    kubectl delete --ignore-not-found deployment nodemgr -n cisco-terraform
    kubectl delete --ignore-not-found deployment clustermgr -n cisco-terraform 
    kubectl delete --ignore-not-found job terraformtester -n cisco-terraform
else
    echo "No existing cluster. Creating a new cluster"
    kind create cluster --config deployment/sanity/cluster.yaml --name terraform-sanity-cluster
fi

if deploy; then 
    exit 1
fi

# Deploy the tester job 
echo "### Deploying terraform tester job ###"
kubectl delete --ignore-not-found -n cisco-terraform job terraformtester
kind load docker-image terraform-testsuite:v1 --name terraform-sanity-cluster
kubectl apply -f deployment/sanity/sanity.yaml

# Wait for the tester job to be up and running
echo "Waiting for tester to setup..."
sleep 10
for i in {1..10}
    do
        TNAME=$(kubectl get pods --selector=argo.job=terraformtester -n cisco-terraform -o jsonpath="{.items[*].metadata.name}")
        if [ -n $TNAME ]
        then
            break
        fi
        sleep 5
    done

# Exit if you cannot find the tester job pod after all this wait
if [ -z $TNAME ]
then
    echo "Error finding terraformtester job pod"
    exit 1
fi

# Setup a logfile to caputer the tester container logs
LOGFILE=$(mktemp -t terraformtester.log)
kubectl logs -f $TNAME -n cisco-terraform | tee -a $LOGFILE
ln -sf $LOGFILE $TMPDIR/terraformtester-latest.log

# Monitor the status of the tester job
for i in {1..16}
    do
        ZOOKR=$(kubectl get pods --selector=argo.deploy=zoo -n argo-infra -o jsonpath="{.items[*].status.phase}")
        KAFKA=$(kubectl get pods --selector=argo.deploy=kafka -n argo-infra -o jsonpath="{.items[*].status.phase}")
        MONGO=$(kubectl get pods --selector=argo.deploy=mongo -n argo-infra -o jsonpath="{.items[*].status.phase}")
        TESTR=$(kubectl get pods --selector=argo.job=terraformtester -n cisco-terraform -o jsonpath="{.items[*].status.phase}") 
        if [[ -n $MONGO && -n $ZOOKR && -n $KAFKA ]]
        then
            if [[ $MONGO == "Running" && $ZOOKR == "Running"  && $KAFKA == "Running" && $TESTR == "Running" ]]
            then
                echo "terraform test is running"
            else
                if [[ $TESTR == "Succeeded" ]]
                then
                    echo "terraform test succeeded"
                else
                    echo "terraform tester exited with " $TESTR
                fi
                break
            fi
        fi
        sleep 20
    done

# Dump the final state of the containers in all the namespaces
kubectl get pods -n argo-infra
kubectl get pods -n cisco-terraform

# Show where the logfile is situated
echo "Logs stored under $LOGFILE"