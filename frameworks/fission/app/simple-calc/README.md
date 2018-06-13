
# Workflow

## Create an empty directory
```bash
$ mkdir -p ~/dev/api && cd ~/dev/api
$ git clone https://github.com/transport-intelligence/induction-serverless.git
```

## Initialize the directory with the specifications
This creates a ``specs/`` directory. There is a ``fission-config.yaml`` in there.
This file has a unique ID in it; everything created on the cluster from these specs
will be annotated with that unique ID.
```bash
$ cd ~/dev/api/induction-serverless/fission/app/simple-calc
$ fission spec init
Creating fission spec directory 'specs'
```
## Setup a Python environment
It produces the ``specs/env-python.yaml`` specification file
```bash
$ export FISSION_VERSION=$(curl -s https://api.github.com/repos/fission/fission/releases/latest | grep tag_name | cut -d '"' -f 4)
$ fission env create --spec --name python --image fission/python-env:$FISSION_VERSION --builder fission/python-build-env:$FISSION_VERSION
```

## Create specs for these functions
Let’s create a specification for each of these functions.
This specifies the function name, where the code lives,
and associates the function with the python environment:
```bash
$ fission function create --spec --name calc-form --env python --src python/form.py --entrypoint form.main
$ fission function create --spec --name calc-eval --env python --src python/calc.py --entrypoint calc.main
```

You can see the generated YAML files in ``specs/function-calc-form.yaml``
and ``specs/function-calc-eval.yaml``.


## Create HTTP trigger specs
This creates YAML files specifying that ``GET`` requests on ``/form``
and ``/eval`` invoke the functions ``calc-form`` and ``calc-eval`` respectively.
```bash
$ fission route create --spec --method GET --url /form --function calc-form
$ fission route create --spec --method GET --url /eval --function calc-eval
```

## Validate the specifications
Spec validation does some basic checks: it makes sure there are no
duplicate functions with the same name, and that references between various resources are correct.
```bash
$ fission spec validate
```

## Apply: deploy the functions to Fission
You can simply use apply to deploy the environment, functions and HTTP triggers to the cluster.
```bash
$ fission spec apply --wait
```
This uses the kubeconfig to connect to Fission, just like ``kubectl``.

## Test a function
Make sure your function is working:
```bash
$ fission function test --name calc-form
```

You should see the output of the calc-form function.

To test the other function, open the URL of the Fission router service in a browser, enter two numbers and an operator, and click submit.

(If you don’t know the address of the Fission router, you can find it with kubectl: kubectl -n fission get service router.)

## Modify the function and re-deploy it
Let’s try modifying a function: let’s change the calc-eval function to support multiplication, too.
```python
    ...
    
    elsif operator == '*':
        result = num_1 * num_2

    ...
```

You can add the above lines to calc.py, or just download the modified function:
```bash
$ curl -Lo calc.py http://zzz
```

To deploy your changes, simply apply the specs again:
```bash
$ fission spec apply --wait
```

This should output something like:
```bash
1 archive updated: calc-eval-xyz
1 package updated: calc-eval-xyz
1 function updated: calc-eval
```

Your new updated function is deployed!

Test it out by entering a ``*`` for the operator in the form!

## Add dependencies to the function
Let’s say you’d like to add a ``pip requirements.txt`` to your function,
and include some libraries in it, so you can import them in your functions.
Create a ``requirements.txt``, and add something to it:

xxx
Modify the ``ArchiveUploadSpec`` inside ``specs/function-.yaml``

Once again, deploying is the same:
```bash
$ fission spec apply --wait
```

This command figures out that one function has changed, uploads the source to the cluster,
and waits until the Fission builder on the cluster finishes rebuilding this updated source code.

## A bit about how this works
Kubernetes manages its state as a set of resources. Deployments, Pod, Services are examples of resources.
They represent a target state, and Kubernetes then does the work to ensure this target state is met.

Kubernetes resources can be extended, using Custom Resources. Fission runs on top of Kubernetes and sets up your functions, environments and triggers as Custom Resources. You can see even these custom resources from kubectl: try kubectl get customeresourcedefinitions or kubectl get function.fission.io

Your specs directory is, basically, set of resources plus a bit of configuration. Each YAML file contains one or more resources. They are separated by a “—” separator. The resources are functions, environments, triggers.

There’s a special resource there, ArchiveUploadSpec. This is in fact not a resource, just looks like one in the YAML files. It is used to specify and name a set of files that will be uploaded to the cluster. fission spec apply uses these ArchiveUploadSpecs to create archives locally and upload them. The specs reference these archives using archive:// URLs. These aren’t “real” URLs; they are replaced by http URLs by the fission spec implementation after the archives are uploaded to the cluster. On the cluster, Archives are tracked with checksums; the Fission CLI only uploads archives when their checksum has changed.

## Usage references
* https://docs.fission.io/0.7.2/tutorial/developer-workflow/#usage-reference


