#!/bin/bash

# Create a sops / age secret key
age-keygen > ./key.txt

# Create the Kubernetes secret to give Argo access to the age key
kubectl create ns argo || true
kubectl -n argo create secret generic age --from-file=./key.txt || true