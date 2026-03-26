# S3 Viewfy

A modern, self-hosted web application for browsing and managing files on any **S3-compatible** object storage. Built with **Next.js 16**, **shadcn/ui**, and the **AWS SDK v3**.

Deploy it with Docker, pass your credentials as environment variables, and instantly get a beautiful file manager for your buckets — no setup required on the client side.

![S3 Viewfy Screenshot](https://img.shields.io/badge/status-stable-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Docker](https://img.shields.io/badge/docker-ready-blue)

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/s3-viewfy?referralCode=zeN56g&utm_medium=integration&utm_source=template&utm_campaign=generic)
---

## ✨ Features

- **Universal S3 Support** — Works with AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces, Backblaze B2, Wasabi, Hetzner, and any S3-compatible provider.
- **Built-in Authentication** — Protect access with username/password via environment variables.
- **Browse & Navigate** — Folder hierarchy with breadcrumb navigation and pagination.
- **Upload Files** — Drag & drop or click to upload files to any bucket/folder.
- **Download Files** — Generate presigned URLs for secure, direct downloads.
- **Delete Objects** — Remove files with a confirmation dialog.
- **Docker-First** — Ship it as a Docker image. Users just `docker run` with env vars.
- **Environment Variable Auto-Connect** — Set credentials via env vars and the app connects automatically on startup.
- **Manual Mode** — When no env vars are set, users can enter credentials through a connection dialog.
- **Light & Dark Mode** — Toggle between themes with localStorage persistence.
- **Login Rate Limiting** — Brute-force protection with 3 attempts per minute per IP.
- **Zero Credential Exposure** — S3 credentials from env vars never leave the server, not even to the browser.
- **File Type Icons** — Visual identification for images, videos, code, archives, and more.

---

## 🚀 Quick Start

### With Docker (Recommended)

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

Open [http://localhost:3000](http://localhost:3000) — you're connected!

### With Docker Compose

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
      - S3_BUCKET=my-bucket          # optional
      - S3_FORCE_PATH_STYLE=true     # optional
      - AUTH_USERNAME=admin           # optional
      - AUTH_PASSWORD=secret          # optional
```

```bash
docker compose up
```

### Without Docker (Development)

```bash
git clone https://github.com/oktayparlak/s3-viewfy.git
cd s3-viewfy
npm install
npm run dev
```

---

## 🔧 Environment Variables

### S3 Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `S3_ENDPOINT` | ✅ | — | S3-compatible endpoint URL |
| `S3_ACCESS_KEY_ID` | ✅ | — | Access key for authentication |
| `S3_SECRET_ACCESS_KEY` | ✅ | — | Secret key for authentication |
| `S3_REGION` | ✅ | — | Storage region (e.g., `us-east-1`, `eu-west-1`) |
| `S3_BUCKET` | ❌ | *(empty)* | Pre-select a specific bucket. Leave empty to show all. |
| `S3_FORCE_PATH_STYLE` | ❌ | `true` | Use path-style URLs. Set to `false` for AWS virtual-hosted style. |

### Authentication

| Variable | Required | Default | Description |
|---|---|---|---|
| `AUTH_USERNAME` | ❌ | — | Username for login. Auth is disabled if not set. |
| `AUTH_PASSWORD` | ❌ | — | Password for login. Both must be set to enable auth. |

> **How it works:** When S3 env vars are set, the app auto-connects on startup. When `AUTH_USERNAME` and `AUTH_PASSWORD` are set, users must log in before accessing the file manager. When auth env vars are not set, the app is open to anyone with the URL.

---

## 🏗️ Build & Publish

### Build the Docker Image

```bash
docker build -t oktayparlak/s3-viewfy .
```

### Push to Docker Hub

```bash
docker login
docker push oktayparlak/s3-viewfy
```

### Multi-Architecture Build (amd64 + arm64)

```bash
docker buildx build --platform linux/amd64,linux/arm64 \
  -t oktayparlak/s3-viewfy:latest \
  --push .
```

---

## 🎨 Supported Providers

| Provider | Endpoint Example |
|---|---|
| **AWS S3** | `https://s3.amazonaws.com` |
| **MinIO** | `http://localhost:9000` |
| **Cloudflare R2** | `https://<account-id>.r2.cloudflarestorage.com` |
| **DigitalOcean Spaces** | `https://nyc3.digitaloceanspaces.com` |
| **Backblaze B2** | `https://s3.us-west-004.backblazeb2.com` |
| **Wasabi** | `https://s3.wasabisys.com` |
| **Linode Object Storage** |`https://us-east-1.linodeobjects.com` |
| **Hetzner Object Storage** | `https://fsn1.your-objectstorage.com` |
| **Yandex Object Storage** | `https://storage.yandexcloud.net` |
| **Alibaba Cloud OSS** | `https://oss-us-west-1.aliyuncs.com` |
| **Oracle Cloud** | `https://<ns>.compat.objectstorage.<region>.oraclecloud.com` |

Any service that implements the S3 API will work.

---

## 📁 Project Structure

```
s3-viewfy/
├── src/
│   ├── app/
│   │   ├── api/s3/           # S3 API routes
│   │   │   ├── buckets/      # List buckets
│   │   │   ├── objects/      # List objects
│   │   │   ├── download/     # Presigned download URLs
│   │   │   ├── delete/       # Delete objects
│   │   │   ├── upload/       # Upload files
│   │   │   └── config/       # Env-based config endpoint
│   │   ├── api/auth/         # Auth API routes
│   │   │   ├── login/        # Login endpoint
│   │   │   ├── logout/       # Logout endpoint
│   │   │   └── status/       # Auth status check
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Main app page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── auth-provider.tsx        # Auth state management
│   │   ├── login-screen.tsx         # Login page
│   │   ├── connection-provider.tsx  # S3 connection state
│   │   ├── connection-dialog.tsx    # Manual connection form
│   │   ├── header.tsx        # App header
│   │   ├── sidebar.tsx       # Bucket list sidebar
│   │   └── file-browser.tsx  # File table with actions
│   └── lib/
│       ├── s3.ts             # S3 client utilities
│       ├── s3-config.ts      # Server-side config resolver
│       └── utils.ts          # Utility functions
├── Dockerfile                # Multi-stage Docker build
├── docker-compose.yml        # Docker Compose example
└── package.json
```

---

## 🔒 Security Notes

- Credentials are **never stored on disk** — they live in memory (or env vars) only.
- When using Docker, credentials are passed as environment variables and never embedded in the image.
- All S3 operations go through server-side API routes — credentials are never exposed to the browser.
- **Zero credential exposure:** When using env vars, S3 credentials stay server-side. The config API only returns `configured: true/false` — no keys, endpoints, or secrets.
- Downloads use **presigned URLs** that expire after 1 hour.
- Authentication uses **HTTP-only cookies** for session management.
- Sessions expire after **24 hours**.
- Login is **rate-limited** to 3 attempts per minute per IP.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI:** [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://radix-ui.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **S3 SDK:** [AWS SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📄 License

MIT
