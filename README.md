# NodeJsLab04

This repo contains two directories: ```task1``` and ```task2``` from ```NodeJsLab03``` repo.
Their purpose is to provide corresponding Swagger docs for API built in ```NodeJsLab03``` repo.

### Usage

Step 1. Clone the repo
```$xslt
git clone https://github.com/vlad9719/NodeJsLab04
```

Step 2. If you do not have database ```contracts``` setup on your computer from [NodeJsLab03](https://github.com/vlad9719/NodeJsLab03)
repo, you should perform steps 2-6 from [README of that repo](https://github.com/vlad9719/NodeJsLab03#installing).

If you have that database, proceed to Step 3.


Step 3. Go to one of task implementation directories
```$xslt
cd task1
//or
cd task2
```

Step 4. Run the server
```$xslt
ts-node index.ts
```

Step 5. View Swagger docs in browser by entering into address bar the following URL:
```$xslt
http://localhost:8080/api-docs
```