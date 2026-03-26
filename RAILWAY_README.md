# Deploy and Host S3 Viewfy on Railway

S3 Viewfy is a modern, self-hosted web file manager for any S3-compatible object storage. Browse, upload, download, and delete files through a premium UI with built-in authentication, light/dark mode, and zero credential exposure.

## About Hosting S3 Viewfy

S3 Viewfy is deployed as a Docker container, making it straightforward to host on Railway. The app requires environment variables for S3 connection (endpoint, access key, secret key, region) and optionally for authentication (username, password). Railway auto-detects the Dockerfile, builds the image, and assigns a public URL. The app is fully stateless — no databases or persistent volumes are needed. All data lives in your S3 bucket. Credentials stay server-side and are never exposed to the browser, ensuring secure operation on public deployments.

## Common Use Cases

- Self-hosted S3 file manager for teams to browse, upload, and download files from any S3-compatible storage without installing CLI tools
- Secure internal dashboard for managing object storage on MinIO, Cloudflare R2, DigitalOcean Spaces, Backblaze B2, or Wasabi
- Quick-deploy file browser for clients or stakeholders who need access to specific buckets without AWS console credentials

## Dependencies for S3 Viewfy Hosting

- An S3-compatible storage provider (AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces, Backblaze B2, Wasabi, Hetzner, etc.)
- Access credentials (endpoint URL, access key, secret key, region) for your storage provider

### Deployment Dependencies

- [Docker](https://www.docker.com/) — The app is containerized with a multi-stage Dockerfile
- [Node.js 20](https://nodejs.org/) — Used during the build stage
- [Next.js 16](https://nextjs.org/) — Framework powering the application (standalone output mode)
- [AWS SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) — S3 client for all storage operations

### Implementation Details

The following environment variables should be configured in your Railway service:

```
# Required — S3 Connection
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=us-east-1

# Optional — Pre-select a bucket
S3_BUCKET=my-bucket

# Optional — Authentication (recommended for public deployments)
AUTH_USERNAME=admin
AUTH_PASSWORD=your-secure-password
```

When `AUTH_USERNAME` and `AUTH_PASSWORD` are set, users must log in before accessing the file manager. Login is rate-limited to 3 attempts per minute per IP. When not set, the app is open to anyone with the URL.

## Why Deploy S3 Viewfy on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying S3 Viewfy on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
