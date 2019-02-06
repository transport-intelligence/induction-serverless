# References

* Compose on Kubernetes: https://github.com/docker/compose-on-kubernetes

# Installation

* Check that Compose on Kubernetes is available:
```bash
$ kubectl api-versions | grep compose
compose.docker.com/v1beta1
compose.docker.com/v1beta2
```

# Get started
* Deploy the `hellokube` application on the local Kubernetes cluster:
```bash
$ docker stack deploy --orchestrator=kubernetes -c docker-compose.yaml hellokube
Ignoring unsupported options: build

service "web": build is ignored
service "db": build is ignored
service "words": build is ignored
Waiting for the stack to be stable and running...
db: Ready		[pod status: 1/1 ready, 0/1 pending, 0/1 failed]
words: Ready		[pod status: 5/5 ready, 0/5 pending, 0/5 failed]
web: Ready		[pod status: 1/1 ready, 0/1 pending, 0/1 failed]

Stack hellokube is stable and running
```

* Check that the `hellokube` application (stack) is running:
```bash
$ docker stack ls
NAME                SERVICES            ORCHESTRATOR        NAMESPACE
hellokube           3                   Kubernetes          default
$ docker stack ps hellokube
ID                  NAME                               IMAGE                             NODE                DESIRED STATE       CURRENT STATE            ERROR               PORTS
06fbedd1-2a1        hellokube_db-7ff6c7f7d8-vzbpn      dockersamples/k8s-wordsmith-db    docker-desktop      Running             Running 41 seconds ago                       
07053375-2a1        hellokube_web-58b89ccbf-t7rs6      dockersamples/k8s-wordsmith-web   docker-desktop      Running             Running 41 seconds ago                       *:0->80/tcp
0710da3a-2a1        hellokube_words-7c64c88d97-7ngzk   dockersamples/k8s-wordsmith-api   docker-desktop      Running             Running 40 seconds ago                       
070d5d0a-2a1        hellokube_words-7c64c88d97-cw5lj   dockersamples/k8s-wordsmith-api   docker-desktop      Running             Running 40 seconds ago                       
072b0ef5-2a1        hellokube_words-7c64c88d97-d8sjw   dockersamples/k8s-wordsmith-api   docker-desktop      Running             Running 40 seconds ago                       
06fc099a-2a1        hellokube_words-7c64c88d97-jkbnc   dockersamples/k8s-wordsmith-api   docker-desktop      Running             Running 41 seconds ago                       
072b8095-2a1        hellokube_words-7c64c88d97-l62xm   dockersamples/k8s-wordsmith-api   docker-desktop      Running             Running 40 seconds ago                       
```

* Shutdown the `hellokube` application (stack):
```bash
$ docksr stack rm hellokube
```


