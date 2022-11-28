- Access the dashboard

````
kubectl -n traefik port-forward $(kubectl get pods --selector "app.kubernetes.io/name=traefik" --output=name) 9000:9000
````