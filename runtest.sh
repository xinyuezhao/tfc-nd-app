#!/bin/bash

function cleanup {
    docker stop node-manager 
    docker stop cluster 
    docker stop argome-testsuite 
    docker stop kafka
    docker stop zookeeper-bitnami
    docker stop mongo-svc 
    docker stop argome-pilot 
    docker-compose rm -f
}

function restart {
    docker stop node-manager
    docker-compose rm -f
}

cleanup
docker-compose up -d

for i in {1..60}
do
   STATUS=$(docker inspect argome-testsuite --format='{{.State.Status}}')
   TIME=$(($i*10))
   echo "ARGO tests $STATUS for $TIME seconds...."
   docker-compose logs --tail 10 argome-testsuite 
   if [ $(docker inspect argome-testsuite --format='{{.State.Status}}') == "exited" ]
   then
       echo "Run exited"
       docker-compose logs argome-testsuite 
       docker-compose logs node-manager 
       docker-compose logs cluster 
       docker-compose logs argome-pilot 
       if [ $(docker inspect argome-testsuite --format='{{.State.ExitCode}}') == 0 ]
       then
           echo "Tests passed"
           cleanup
           exit 0
        else
            echo "Tests failed"
            cleanup
            exit 1
        fi
       break
    fi
    sleep 10
done
echo "Tests did not complete"
docker-compose logs argome-testsuite 
docker-compose logs node-manager 
docker-compose logs cluster 
docker-compose logs argome-pilot 
cleanup
