# References

## Kubernetes
* http://kubernetes.io
* http://github.com/kubernetes/kubernetes
* http://github.com/kubernetes/minikube
* http://docs.docker.com/docker-for-mac/kubernetes
* https://www.linuxtechi.com/install-kubernetes-1-7-centos7-rhel7

## Kubeless
* http://kubeless.io
* https://github.com/kubeless/kubeless
* Download/build: https://github.com/kubeless/kubeless/releases

# Installation
* Reference: http://kubeless.io/docs/quick-start

## Kubeless binaries

### MacOS/Linux
```bash
$ su -
$ mkdir -p /opt/kubeless
$ export OS=$(uname -s| tr '[:upper:]' '[:lower:]')
$ export RELEASE=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4)
$ wget https://github.com/kubeless/kubeless/releases/download/$RELEASE/kubeless_$OS-amd64.zip -O /opt/kubeless/kubeless_$OS-amd64.zip
$ cd /opt/kubeless
$ unzip kubeless_$OS-amd64.zip
$ cd /usr/local/bin && ln -s /opt/kubeless/bundles/kubeless_$OS-amd64/kubeless kubeless
```

## Kubeless services

### Start the Kubernetes cluster
* If needed, start the Kubernetes cluster. For instance, with Minikube:
```bash
$ minikube start
```

### Installation of the RBAC Kubeless
* RBAC stands for Role-Based Access Control
```bash
$ export RELEASE=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4)

$ echo "Kubeless version: $RELEASE"
Kubeless version: v1.0.0-alpha.4

$ kubectl create ns kubeless
namespace "kubeless" created

$ kubectl create -f https://github.com/kubeless/kubeless/releases/download/$RELEASE/kubeless-$RELEASE.yaml
configmap "kubeless-config" created
deployment.apps "kubeless-controller-manager" created
serviceaccount "controller-acct" created
customresourcedefinition.apiextensions.k8s.io "functions.kubeless.io" created
customresourcedefinition.apiextensions.k8s.io "httptriggers.kubeless.io" created
customresourcedefinition.apiextensions.k8s.io "cronjobtriggers.kubeless.io" created
```

### Check the Kubernetes cluster
```bash
$ kubectl get pods -n kubeless
NAME                                           READY     STATUS             RESTARTS   AGE
kubeless-controller-manager-5c5f5d86c5-tttjn   0/1       CrashLoopBackOff   4          2m

$ kubectl get configmap -n kubeless
NAME              DATA      AGE
kubeless-config   10        38ms

$ kubectl get deployment -n kubeless
NAME                          DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
kubeless-controller-manager   1         1         1            0           3m

$ kubectl get customresourcedefinition
NAME                          AGE
cronjobtriggers.kubeless.io   3m
functions.kubeless.io         3m
httptriggers.kubeless.io      3m
```

## Kubeless direct (no serverless) - Toy application

### Installation
* Documentation
```bash
$ kubeless function deploy --help
```

* Deploy the hello world application
```bash
$ cd python && kubeless function deploy hello --runtime python3.6 --from-file hello.py --handler hello.hello && cd -
INFO[0000] Deploying function...                        
INFO[0000] Function hello submitted for deployment      
INFO[0000] Check the deployment status executing 'kubeless function ls hello'
$ kubeless function ls hello
NAME 	NAMESPACE	HANDLER   	RUNTIME  	DEPENDENCIES	STATUS                        
hello	default  	test.hello	python3.6	            	1/1 READY
```

* Check the deployed function
```bash
$ kubectl get functions
NAME         AGE
hello        1h

$ kubeless function ls
NAME            NAMESPACE   HANDLER       RUNTIME   DEPENDENCIES    STATUS
hello           default     hello.hello   python3.6                 1/1 READY

$ kubeless function describe hello
Name:        	hello                                       
Namespace:   	default                                     
Handler:     	hello.hello                                 
Runtime:     	python3.6                                   
Label:       	{"created-by":"kubeless","function":"hello"}
```

* Troubleshooting
```bash
$ kubectl logs -n kubeless -l kubeless=controller
```

### Call the hello world application

#### Through Kubeless
```bash
$ kubeless function call hello --data 'Hello world!'
Hello world!
```

#### Through Kubectl
```bash
$ kubectl proxy -p 8009 &
Starting to serve on 127.0.0.1:8009
$ curl -L --data '{"Another": "Echo"}' --header "Content-Type:application/json" \
  localhost:8009/api/v1/namespaces/default/services/hello:http-function-port/proxy/
{"Another": "Echo"}
```

## Clean up
* Remove the application
```bash
$ kill %1 # it should be kubectl proxy
$ kubeless function delete hello
$ kubeless function ls
NAME	NAMESPACE	HANDLER	RUNTIME	DEPENDENCIES	STATUS
```

* Remove Kubeless
```bash
$ kubectl delete -f https://github.com/kubeless/kubeless/releases/download/$RELEASE/kubeless-$RELEASE.yaml
```

 
## Kubeless as serverless plugin - To-do list management application

### Frontend
* See [app/todo-list-mgt/frontend/README](app/todo-list-mgt/frontend/README.md)

### Backend
* See [app/todo-list-mgt/backend/README](app/todo-list-mgt/backend/README.md)

