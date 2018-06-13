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

## JavaScript S3 Bucket Display

* Create the S3 bucket
```bash
$ aws s3 mb s3://playground-dev-s3-sam-test --region eu-central-1
```

* Package the application and upload the artefact
```bash
$ sam package --template-file example.yaml --output-template-file serverless-output.yaml --s3-bucket playground-dev-s3-sam-test
Uploading to ea566cb786a9b4dcb78167dc0e7327b2  938 / 938.0  (100.00%)
Successfully packaged artifacts and wrote output template to file serverless-output.yaml.
Execute the following command to deploy the packaged template
aws cloudformation deploy --template-file /home/build/dev/infra/api/induction-serverless/frameworks/aws/sam-s3-display-app/serverless-output.yaml --stack-name <YOUR STACK NAME>
```

* Check that the artefact has been uploaded onto the S3 bucket
```bash
$ aws s3 ls s3://playground-dev-s3-sam-test --recursive --human-readable --summarize
2018-06-13 18:05:01    1.0 KiB ea566cb786a9b4dcb78167dc0e7327b2

Total Objects: 1
   Total Size: 1.0 KiB
```

* Deploy the application
```bash
$ sam deploy --template-file serverless-output.yaml --stack-name sam-test-v001 --region eu-central-1
```



