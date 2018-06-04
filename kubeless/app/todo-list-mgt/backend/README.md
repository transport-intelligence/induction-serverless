# Serverless backend

## Install Kubeless
* Reference:
  + https://kubeless.io/docs/quick-start/
  + [main README.md](../../../README.md)).
  + http://github.com/transport-intelligence/induction-serverless
```bash
$ export KUBELESS_VERSION=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4)
$ echo "Kubeless version: $KUBELESS_VERSION"
$ kubectl create ns kubeless
namespace "kubeless" created
$ kubectl create -f https://github.com/kubeless/kubeless/releases/download/$KUBELESS_VERSION/kubeless-$KUBELESS_VERSION.yaml
configmap "kubeless-config" created
deployment.apps "kubeless-controller-manager" created
serviceaccount "controller-acct" created
clusterrole.rbac.authorization.k8s.io "kubeless-controller-deployer" created
clusterrolebinding.rbac.authorization.k8s.io "kubeless-controller-deployer" created
customresourcedefinition.apiextensions.k8s.io "functions.kubeless.io" created
customresourcedefinition.apiextensions.k8s.io "httptriggers.kubeless.io" created
customresourcedefinition.apiextensions.k8s.io "cronjobtriggers.kubeless.io" created
```

## Install an Ingress Controller
* Reference:
  + https://kubernetes.github.io/ingress-nginx/
  + https://blog.getambassador.io/kubernetes-ingress-nodeport-load-balancers-and-ingress-controllers-6e29f1c44f2d
  + https://blog.getambassador.io/building-ambassador-an-open-source-api-gateway-on-kubernetes-and-envoy-ed01ed520844

### With Minikube
If you do not have it yet and you are working with Minikube, you can enable
the addon executing:
```bash
$ minikube addons enable ingress
```

### With Kubernetes-enabled Docker for Mac
* Reference:
  + https://kubernetes.github.io/ingress-nginx/deploy/#docker-for-mac
  + https://github.com/jnewland/local-dev-with-docker-for-mac-kubernetes

* If needed, stop the Apache Web server
```bash
$ sudo /usr/sbin/apachectl stop
```

* Register the Ingress controller
```bash
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/mandatory.yaml
namespace "ingress-nginx" configured
deployment "default-http-backend" created
service "default-http-backend" created
configmap "nginx-configuration" created
configmap "tcp-services" created
configmap "udp-services" created
serviceaccount "nginx-ingress-serviceaccount" created
clusterrole "nginx-ingress-clusterrole" created
role "nginx-ingress-role" created
rolebinding "nginx-ingress-role-nisa-binding" created
clusterrolebinding "nginx-ingress-clusterrole-nisa-binding" created
deployment "nginx-ingress-controller" created
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/provider/cloud-generic.yaml
```

* Note that it is not enough, for instance for the to-do application to work.
  If you know how to make it work, as well as with the Minikube case, please
  do not hesitate to contribute, for instance through a pull request.

### Check the Ingress service
```bash
$ kubectl get pods --all-namespaces -l app=ingress-nginx
NAMESPACE       NAME                                        READY     STATUS    RESTARTS   AGE
ingress-nginx   nginx-ingress-controller-5f6d649c67-gg6p9   1/1       Running   0          1m
$ POD_NAMESPACE=ingress-nginx
$ POD_NAME=$(kubectl get pods -n $POD_NAMESPACE -l app=ingress-nginx -o jsonpath={.items[0].metadata.name})
$ kubectl exec -it $POD_NAME -n $POD_NAMESPACE -- /nginx-ingress-controller --version
-------------------------------------------------------------------------------
NGINX Ingress controller
  Release:    0.15.0
  Build:      git-df61bd7
  Repository: https://github.com/kubernetes/ingress-nginx
-------------------------------------------------------------------------------
$ kubectl get ingress
NAME      HOSTS              ADDRESS   PORTS     AGE
todos     localhost.xip.io             80        3m
```

## Deploy a MongoDB service.
The MongoDB service is used to store the state of the application
```bash
$ kubectl create -f https://raw.githubusercontent.com/bitnami/bitnami-docker-mongodb/3.4.7-r0/kubernetes.yml
```

## Install the NPM packages
```bash
$ npm install
```

## Deploy the serverless functions and services onto the Kubernetes cluster
* The ``serverless`` CLI allows to register both the Kubernetes services and
functions onto the Kubernetes cluster
```bash
$ serverless deploy
Serverless: Packaging service...
Serverless: Deploying function delete...
Serverless: Deploying function update...
Serverless: Deploying function read-one...
Serverless: Deploying function create...
Serverless: Deploying function read-all...
Serverless: Function delete successfully deployed
Serverless: Function read-all successfully deployed
Serverless: Function update successfully deployed
Serverless: Function create successfully deployed
Serverless: Function read-one successfully deployed
```

* Wait that all the pods are in the ``1/1`` (ready) status
```bash
$ kubectl get pods 
NAME                        READY     STATUS    RESTARTS   AGE
create-6f49bb8b55-6g6zp     1/1       Running   0          16m
delete-5d586ff5b9-5r2j6     1/1       Running   0          16m
mongodb-57b5684b96-ww4lb    1/1       Running   0          28m
read-all-6bfb7887cb-7frp6   1/1       Running   0          16m
read-one-847bc75b7b-lsnwq   1/1       Running   0          16m
update-7fc674c69c-nbrlf     1/1       Running   0          16m
```

## Spot the cluster host
```bash
$ serverless info | grep URL
URL:  localhost.xip.io/read
URL:  localhost.xip.io/update
URL:  localhost.xip.io/read-all
URL:  localhost.xip.io/create
URL:  localhost.xip.io/delete
```

## Running the Backend in GKE
In case the cluster is running on Google Computing Engine (GCE),
some additional steps need to be performed.

The [guide for deploying an Ingress Controller](https://github.com/kubernetes/ingress-nginx/blob/master/docs/deploy/index.md) may be followed first.

Make sure to execute the "Mandatory commands", the ones for "Install
without RBAC roles" and also "GCE - GKE" (using RBAC).

Once the guide is successfully followed, the Ingress Controller should appear
running in the `ingress-nginx` namespace
```bash
$ kubectl get pods -n ingress-nginx
NAME                                        READY     STATUS    RESTARTS   AGE
default-http-backend-66b447d9cf-zs2zn       1/1       Running   0          13m
nginx-ingress-controller-6fb4c56b69-cpd5b   1/1       Running   3          12m
```

After a couple of minutes, the Ingress rule appears with an associated `address`
```
$ kubectl get ingress
NAME      HOSTS                   ADDRESS          PORTS     AGE
todos     35.196.179.155.xip.io   35.229.122.182   80        7m
```

Note that the `HOST` is not correct since the IP that the Ingress
provided us with is different. To modify it execute
`kubectl edit ingress todos`.

That will open an editor in which you can change the key
`host: 35.196.179.155.xip.io` for `host: 35.229.122.182.xip.io` or
simply remove the key and the value to make it compatible with any
host. Once you do that you should be able to access the functions:

```
$ kubectl get ingress
NAME      HOSTS                   ADDRESS          PORTS     AGE
todos     35.229.122.182.xip.io   35.229.122.182   80        7m
$ curl 35.229.122.182.xip.io/read-all
[]
```

This host is the one that should be used as `API_URL` in the frontend.

# Troubleshoot

## Web-based dashboard
```bash
$ kubectl dashboard
```

## Kubectl basic information
```bash
$ kubectl get nodes
$ kubectl get pods
$ kubectl get services
$ kubectl get functions
$ serverless describe function
$ serverless info
$ serverless logs -f create
```

## Invoking Kubernetes services

### From ``curl``
* If the ``kubectl`` proxy is not already launched, launch it
```bash
$ kubectl proxy -p 8001 &
```

* Invoke the Kubernetes service through the proxy
```bash
$ export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}'|grep read-all)
$ curl http://localhost:8001/api/v1/namespaces/default/pods/$POD_NAME/proxy/ && echo
[]
```

### Spawning a Bash shell
```bash
$ export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}'|grep read-all)
$ kubectl exec -ti $POD_NAME bash
node@read-all-7d6c68bc9b-x6f97:/$ curl http://localhost:8080 && echo
[]
node@read-all-7d6c68bc9b-x6f97:/$ exit
```

## Logs of Kubernetes services
```bash
$ export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}'|grep read-all)
$ kubectl logs $POD_NAME
```

# Cleanup

```console
$ serverless remove
$ export KUBELESS_VERSION=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4)
$ kubectl delete -f https://github.com/kubeless/kubeless/releases/download/$KUBELESS_VERSION/kubeless-$KUBELESS_VERSION.yaml
$ kubectl delete -f https://raw.githubusercontent.com/bitnami/bitnami-docker-mongodb/3.4.7-r0/kubernetes.yml
```

