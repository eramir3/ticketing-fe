# 🎟️ Ticketing Frontend (FE)

---

## 🚀 Getting Started

### ▶️ Run locally (standard dev mode)

```bash id="3m9g2k"
# Starts the frontend using local configuration
npm run dev
```

👉 Access the app at:

```
http://localhost:4000
```

---

## ☸️ Run with Kubernetes Ingress

```bash id="h2x9pd"
# Starts the frontend configured to work with Kubernetes ingress
npm run dev:k8s
```

### ⚠️ Important Requirements

This mode **only works if an ingress resource is configured** for:

```
ticketing.dev
```

---

### 🔍 Verify Ingress Exists

```bash id="z8m1qc"
kubectl get ingress -A
```

- If you **see ingress resources** → ✅ you're good to go
- If you **don’t see anything** → ❌ `ticketing.dev` will NOT work

---

### ❌ Common Issue

If ingress is not configured, visiting:

```
http://ticketing.dev
```

will return:

```
404 Not Found (NGINX default)
```

---

## 🧠 Notes

- Use `npm run dev` for **simple local development**
- Use `npm run dev:k8s` when:
  - You are testing **full system integration**
  - Backend services are running inside Kubernetes

- Make sure your `/etc/hosts` includes:

  ```
  minikube-ip ticketing.dev
  ```

---
