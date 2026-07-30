## Running Blooger Locally on Kind

### 1. Create a Kind cluster

This creates a single-node Kind cluster and maps the frontend NodePort (`30080`) to your local machine on port `3000`.

```bash
cat <<'EOF' | kind create cluster --name blooger --config -
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 3000
        protocol: TCP
EOF
```

Verify the cluster:

```bash
kubectl cluster-info --context kind-blooger
```

---

### 2. Deploy the application

```bash
cd k8s/kind

kubectl apply -f Blooger.yaml
```

Wait until all pods are running:

```bash
kubectl get pods -n blooger -w
```

---

### 3. Verify the deployment

Check all resources:

```bash
kubectl get all -n blooger
```

Verify the PVC:

```bash
kubectl get pvc -n blooger
```

Expected:

```text
NAME              STATUS   VOLUME   CAPACITY
blooger-db-pvc    Bound    ...      1Gi
```

---

### 4. Access the application

Open your browser:

```
http://localhost:3000
```

If you created the Kind cluster using the provided configuration, the frontend will be accessible without port forwarding because host port **3000** is mapped to the Kubernetes **NodePort (30080)**.

---

### Troubleshooting

Verify that the frontend Service is using the expected NodePort:

```bash
kubectl get svc -n blooger
```

Expected output:

```text
NAME                TYPE       CLUSTER-IP      PORT(S)
blooger-frontend    NodePort   10.xx.xx.xx     80:30080/TCP
```

If the service is using a different NodePort or you cannot access the application, use port forwarding:

```bash
kubectl port-forward svc/blooger-frontend 3000:80 -n blooger
```

Then open:

```
http://localhost:3000
```

---


### 5. Clean up

Delete the application:

```bash
kubectl delete -f Blooger.yaml
```

Delete the Kind cluster:

```bash
kind delete cluster --name blooger
```