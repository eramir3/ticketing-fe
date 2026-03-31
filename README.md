# Ticketing FE

# To start project
```
npm run dev
```

# To start the frontend against the Kubernetes gateway service
```
npm run portforward:gateway
```

In another terminal:
```
npm run dev:k8s
```

This runs the frontend on `http://localhost:4000` and points `AUTH_BASE_URL` and
`API_BASE_URL` to `http://127.0.0.1:3000`.

# To use ticketing.dev through ingress
```
npm run dev:k8s:ingress
```

Use this only when an ingress resource for `ticketing.dev` has been applied. If
`kubectl get ingress -A` shows no resources, `ticketing.dev` will return the
default NGINX `404 Not Found`.

minikube image build -t ticketing-v2-client -f Dockerfile.dev . --alsologtostderr -v=1
