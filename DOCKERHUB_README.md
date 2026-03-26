# S3 Viewfy

A modern web-based file manager for **any S3-compatible object storage**. Browse, upload, download, and delete files with a sleek UI that supports both dark and light mode.

Works with **AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces, Backblaze B2, Wasabi, Hetzner**, and more.

---

## Quick Start

```bash
docker run -p 3000:3000 \
  -e S3_ENDPOINT=https://s3.amazonaws.com \
  -e S3_ACCESS_KEY_ID=your-access-key \
  -e S3_SECRET_ACCESS_KEY=your-secret-key \
  -e S3_REGION=us-east-1 \
  -e AUTH_USERNAME=admin \
  -e AUTH_PASSWORD=your-secure-password \
  oktayparlak/s3-viewfy
```

Open **http://localhost:3000** — you're connected.

---

## Environment Variables

### S3 Configuration

| Variable | Required | Description |
|---|---|---|
| `S3_ENDPOINT` | ✅ | S3-compatible endpoint URL |
| `S3_ACCESS_KEY_ID` | ✅ | Access key |
| `S3_SECRET_ACCESS_KEY` | ✅ | Secret key |
| `S3_REGION` | ✅ | Storage region (e.g. `us-east-1`) |
| `S3_BUCKET` | ❌ | Go directly to a specific bucket |
| `S3_FORCE_PATH_STYLE` | ❌ | Default `true`. Set `false` for AWS virtual-hosted style |

### Authentication

| Variable | Required | Description |
|---|---|---|
| `AUTH_USERNAME` | ❌ | Username for login. Auth disabled if not set. |
| `AUTH_PASSWORD` | ❌ | Password for login. Both must be set to enable auth. |

When all required S3 variables are set, the app **auto-connects** on startup.

When `AUTH_USERNAME` and `AUTH_PASSWORD` are set, users must **log in** before accessing the file manager.

When auth variables are **not set**, the app is open to anyone with the URL.

---

## Docker Compose

```yaml
services:
  s3-viewfy:
    image: oktayparlak/s3-viewfy
    ports:
      - "3000:3000"
    environment:
      - S3_ENDPOINT=https://s3.amazonaws.com
      - S3_ACCESS_KEY_ID=your-access-key
      - S3_SECRET_ACCESS_KEY=your-secret-key
      - S3_REGION=us-east-1
      - S3_BUCKET=my-bucket
      - AUTH_USERNAME=admin
      - AUTH_PASSWORD=secret
```

```bash
docker compose up -d
```

---

## Provider Examples

| Provider | Endpoint |
|---|---|
| AWS S3 | `https://s3.amazonaws.com` |
| MinIO | `http://localhost:9000` |
| Cloudflare R2 | `https://<account-id>.r2.cloudflarestorage.com` |
| DigitalOcean Spaces | `https://nyc3.digitaloceanspaces.com` |
| Backblaze B2 | `https://s3.us-west-004.backblazeb2.com` |
| Wasabi | `https://s3.wasabisys.com` |

---

## Features

- 📂 Browse buckets and folders with breadcrumb navigation
- 📄 Pagination for large directories (50 items per page)
- ⬆️ Upload files (drag & drop supported)
- ⬇️ Download via presigned URLs
- 🗑️ Delete with confirmation
- 🔒 Built-in authentication (username/password via env vars)
- 🛡️ Login rate limiting (3 attempts/min per IP)
- 🔐 Zero credential exposure — S3 keys never leave the server
- 🌗 Light & dark mode with localStorage persistence
- 🎨 Premium glassmorphism UI

---

## Security

- Credentials are passed as **environment variables** — never baked into the image.
- All S3 operations run **server-side** through API routes.
- **Zero credential exposure** — config API returns only `configured: true/false`, no secrets.
- Downloads use **presigned URLs** that expire after 1 hour.
- Auth uses **HTTP-only cookies** (24h expiry).
- Login is **rate-limited** to 3 attempts per minute per IP.

---

## Source Code

[GitHub Repository](https://github.com/oktayparlak/s3-viewfy)
