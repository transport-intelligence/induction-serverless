# References
* https://docs.aws.amazon.com/lambda/latest/dg/serverless_app.html
* https://docs.aws.amazon.com/lambda/latest/dg/test-sam-cli.html
* https://github.com/awslabs/aws-sam-cli

# Installation

## AWS SAM
* As of June 2018, [SAM CLI only works with Python 2](https://github.com/awslabs/aws-sam-cli/issues/387)
```bash
$ source ~/dev/venv2/bin/activate
$ pip install -U pip
$ pip install -U aws-sam-cli
$ sam --version
SAM CLI, version 0.3.0
```

# Sample applications

## Python Hello World
* Initialize with sample files
```bash
$ sam init --runtime python
[+] Initializing project structure...
[SUCCESS] - Read sam-app/README.md for further instructions on how to proceed
[*] Project initialization is now complete
$ mv sam-app sam-hello-world-app
$ cd sam-hello-world-app
$ pip install -r requirements.txt -t hello_world/build/
$ cp -f hello_world/*.py hello_world/build/
```

* Start the local serverless infrastructure
```bash
$ sam local start-api
2018-06-13 16:54:34 Mounting HelloWorldFunction at http://127.0.0.1:3000/hello [GET]
2018-06-13 16:54:34 You can now browse to the above endpoints to invoke your functions. You do not need to restart/reload SAM CLI while working on your functions changes will be reflected instantly/automatically. You only need to restart SAM CLI if you update your AWS SAM template
2018-06-13 16:54:34  * Running on http://127.0.0.1:3000/ (Press CTRL+C to quit)
2018-06-13 16:54:41 Invoking app.lambda_handler (python2.7)
2018-06-13 16:54:41 Found credentials in shared credentials file: ~/.aws/credentials

Fetching lambci/lambda:python2.7 Docker container image......
2018-06-13 16:54:42 Mounting /home/build/dev/infra/api/induction-serverless/frameworks/aws/sam-app/hello_world/build as /var/task:ro inside runtime container
START RequestId: bde531b1-a4fc-429c-8f06-5d02565dbd8b Version: $LATEST
END RequestId: bde531b1-a4fc-429c-8f06-5d02565dbd8b
REPORT RequestId: bde531b1-a4fc-429c-8f06-5d02565dbd8b Duration: 269 ms Billed Duration: 300 ms Memory Size: 128 MB Max Memory Used: 18 MB
2018-06-13 16:54:45 No Content-Type given. Defaulting to 'application/json'.
2018-06-13 16:54:45 127.0.0.1 - - [13/Jun/2018 16:54:45] "GET /hello HTTP/1.1" 200 -
2018-06-13 16:54:45 127.0.0.1 - - [13/Jun/2018 16:54:45] "GET /favicon.ico HTTP/1.1" 403 -
```

* Use the local serverless infrastructure
From another terminal
```bash
$  curl http://127.0.0.1:3000/hello && echo
{"message": "hello world", "location": "212.93.29.64"}
```

