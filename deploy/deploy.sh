#! /bin/sh

# Create vote namespace
kubectl create namespace vote

# Apply the yaml in passed in path default to manifests/v2
manifests_dir=${1:-manifests/v2}
kubectl apply -f $manifests_dir -n vote

# Wait for the deployment to be ready
kubectl rollout status deployment vote-ui -n vote

# Get the vote service  frontend and backend IP
# service_ip=$(kubectl get svc vote-ui -n vote -o jsonpath='{.status.loadBalancer.ingress[0].ip}')