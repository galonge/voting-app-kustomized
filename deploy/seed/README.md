Run Job to create dummy votes

````
$ kubectl create job seed --image=registry.gitlab.com/voting-application/votingapp:seed
````

Delete Job

````
$ kubectl delete job seed
````