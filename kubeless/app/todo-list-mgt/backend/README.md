# Serverless backend

Do the following to deploy and use the backend:

1. Install Kubeless as per https://kubeless.io/docs/quick-start/ (or from the main [README.md](../../../README.md))
   See also https://github.com/transport-intelligence/induction-serverless
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
2. Install an Ingress Controller. If you don't have it yet and you are working with minikube you can enable the addon executing:
```console
$ minikube addons enable ingress
```
3. Deploy a MongoDB service. It will be used to store the state of our application:
```console
$ curl -sL https://raw.githubusercontent.com/bitnami/bitnami-docker-mongodb/3.4.7-r0/kubernetes.yml | kubectl create -f -
```
4. Run `npm install` to install the used npm packages
5. Run `serverless deploy` to deploy the `todo` service in our kubernetes cluster
```console
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
6. Spot the cluster host
```console
$ serverless info | grep URL
```

## Running the Backend in GKE

In case your cluster is running on GCE you need to perform some additional steps. First you need to follow the [guide for deploying an Ingress Controller](https://github.com/kubernetes/ingress-nginx/blob/master/docs/deploy/index.md). Make sure you execute the "Mandatory commands", the ones for "Install without RBAC roles" and also "GCE - GKE" (using RBAC). If you successfully follow the guide you should be able to see the Ingress Controller running in the `ingress-nginx` namespace:

```
$ kubectl get pods -n ingress-nginx
NAME                                        READY     STATUS    RESTARTS   AGE
default-http-backend-66b447d9cf-zs2zn       1/1       Running   0          13m
nginx-ingress-controller-6fb4c56b69-cpd5b   1/1       Running   3          12m
```

After a couple of minutes you will see that the Ingress rule has an `address` associated:

```
$ kubectl get ingress
NAME      HOSTS                   ADDRESS          PORTS     AGE
todos     35.196.179.155.xip.io   35.229.122.182   80        7m
```

Note that the `HOST` is not correct since the IP that the Ingress provided us is different. To modify it execute `kubectl edit ingress todos`. That will open an editor in which you can change the key `host: 35.196.179.155.xip.io` for `host: 35.229.122.182.xip.io` or simply remove the key and the value to make it compatible with any host. Once you do that you should be able to access the functions:

```
$ kubectl get ingress
NAME      HOSTS                   ADDRESS          PORTS     AGE
todos     35.229.122.182.xip.io   35.229.122.182   80        7m
$ curl  35.229.122.182.xip.io/read-all
[]
```

This host is the one that should be used as `API_URL` in the frontend.

# Troubleshoot
* Web-based dashboard
```bash
$ kubectl dashboard
```

* Command-line
```bash
$ kubectl get nodes
$ kubectl get pods
$ kubectl get services
$ kubectl get functions
$ serverless describe function
$ serverless info
$ serverless logs -f create
```

# Cleanup

```console
$ serverless remove
$ export KUBELESS_VERSION=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4)
$ kubectl delete -f https://github.com/kubeless/kubeless/releases/download/$KUBELESS_VERSION/kubeless-$KUBELESS_VERSION.yaml
$ kubectl delete -f https://raw.githubusercontent.com/bitnami/bitnami-docker-mongodb/3.4.7-r0/kubernetes.yml
```

