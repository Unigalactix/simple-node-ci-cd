# Simple Node.js CI/CD 

This project demonstrates a deployment-ready Node.js application with a comprehensive CI/CD pipeline using GitHub Actions and Docker.

## 🚀 Features

* **Deployment Dashboard UI** - Real-time web interface displaying:
  * Current dependency versions (production & development)
  * Last commit information (hash, message, timestamp)
  * Deployment status and environment details
  * Auto-refreshing every 30 seconds
* **Health Monitoring & Recovery** - Automated container health checks:
  * `/health` endpoint for real-time service status monitoring
  * Docker HEALTHCHECK for container orchestration
  * Automated recovery mechanism in CI/CD pipeline (3 retry attempts)
  * Severity 2 alerting on recovery failures
  * Health check validation before deployment
  * Recovery automation tagged monitors for tracking
* **RESTful API Endpoints** for programmatic access to deployment data
* Express.js web server with robust error handling
* Comprehensive logging middleware
* ESLint with flat config setup
* Extensive unit tests using Jest and Supertest
* GitHub Actions CI/CD pipeline with automated deployment tracking
* Docker containerization with optimized Alpine Linux base
* Automated dependency management and security monitoring

## 🛠️ Requirements

* Node.js 18+ & npm
* Docker (for containerization)
* Azure Container Registry (for CI/CD)
* Azure App Service (for deployment)
* Git (for version control)

## 📦 Installation

```bash
npm install
```

## 🚀 Running the Application

```bash
npm start
```

The application will start on port 3000 (or the port specified in the `PORT` environment variable).

Visit `http://localhost:3000` to see the deployment dashboard.

## 🔌 API Endpoints

The application provides the following REST API endpoints:

* `GET /` - Deployment Dashboard UI
* `GET /health` - Health check endpoint for monitoring and container orchestration
* `GET /api/dependencies` - Returns current dependency versions
* `GET /api/last-commit` - Returns last commit information
* `GET /api/deployment-status` - Returns deployment status and metadata

### Example API Responses

**GET /health**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-30T00:00:19.451Z",
  "uptime": 14.872847876,
  "service": "simple-node-ci-cd",
  "version": "2.0.0",
  "memory": {
    "usage": {
      "rss": 53858304,
      "heapTotal": 7839744,
      "heapUsed": 6229736,
      "external": 2039899,
      "arrayBuffers": 16619
    },
    "free": 21
  }
}
```

**GET /api/dependencies**
```json
{
  "dependencies": {
    "express": "^4.22.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.1.0"
  }
}
```

**GET /api/last-commit**
```json
{
  "hash": "49c4daa",
  "message": "Initial plan",
  "timestamp": "2025-12-23 19:11:38 +0000"
}
```

**GET /api/deployment-status**
```json
{
  "status": "success",
  "timestamp": "2025-12-23T19:17:24.377Z",
  "environment": "production",
  "build_number": "42",
  "commit_sha": "abc123...",
  "branch": "main"
}
```

## 🧪 Run Tests

```bash
npm test
```

Tests include:
* UI rendering validation
* API endpoint functionality
* Error handling
* Data structure validation

## 🧹 Lint Code

```bash
npm run lint
```

## 🐳 Build Docker Image

```bash
docker build -t <your-acr-name>.azurecr.io/simple-node-ci-cd .
```

## 🧬 CI/CD Pipeline

The pipeline is configured in `.github/workflows/ci-cd.yml`. It automatically:

* Checks out code with full git history
* Installs dependencies
* Runs comprehensive tests
* Performs code linting
* Generates deployment metadata (timestamp, status, build info)
* Builds Docker image
* **Tests Docker health check locally before deployment**
* Pushes to Azure Container Registry (ACR)
* Deploys to Azure App Service
* **Performs health check validation with automated recovery**
* Tracks deployment status (success/failure)

### Health Monitoring & Recovery (NJS-3)

The CI/CD pipeline includes automated health monitoring and recovery:

#### Local Health Check (Pre-Deployment)
* Validates `/health` endpoint responds correctly before pushing to registry
* Ensures Docker HEALTHCHECK configuration works
* Fails fast if health endpoint is unavailable

#### Production Health Check (Post-Deployment)
* Waits 30 seconds for deployment stabilization
* Attempts health check with 3 retry attempts
* 40-second intervals between retries
* Validates response status and structure

#### Automated Recovery
* Automatically retries failed health checks
* Logs all recovery attempts for debugging
* Uploads recovery logs as artifacts

#### Severity 2 Alerting
* Creates GitHub issue on recovery failure
* Tags: `recovery_automation`, `sev-2`, `health-check-failure`, `njs-3`
* Includes detailed incident information
* Links to workflow run for debugging
* Prevents duplicate alerts

### Automated Deployment Tracking

The CI/CD pipeline automatically generates a `deployment-status.json` file containing:
* Deployment status (success/failed)
* Timestamp of deployment
* Environment name
* Build number
* Commit SHA
* Branch name

## 🔐 Secrets Required

Set these in your GitHub repository settings under `Settings > Secrets and variables > Actions`:

* `AZURE_REGISTRY_NAME` - Your Azure Container Registry name (without .azurecr.io)
* `AZURE_REGISTRY_USERNAME` - Your Azure Container Registry username
* `AZURE_REGISTRY_PASSWORD` - Your Azure Container Registry password
* `AZURE_APP_NAME` - Your Azure App Service name
* `AZURE_WEBAPP_PUBLISH_PROFILE` - Your Azure App Service publish profile

## 📁 Project Structure

```
.
├── app.js                    # Main application with UI and API endpoints
├── Dockerfile                # Docker configuration
├── test/
│   └── app.test.js          # Comprehensive test suite
├── .github/
│   └── workflows/
│       └── ci-cd.yml        # CI/CD pipeline with deployment tracking
├── eslint.config.mjs        # ESLint configuration
├── .dockerignore            # Docker ignore patterns
├── .gitignore               # Git ignore patterns
├── package.json             # Project dependencies and scripts
└── package-lock.json        # Locked dependency versions
```

## 🔒 Security & Error Handling

* Robust error handling middleware for Express
* Comprehensive logging for debugging and monitoring
* Try-catch blocks for all async operations
* Input validation and sanitization
* Automated security vulnerability scanning via CI/CD

## 🎨 Deployment Dashboard

The deployment dashboard provides a beautiful, responsive UI with:
* Gradient background design
* Card-based layout with hover effects
* Color-coded status badges
* Scrollable dependency lists
* Real-time auto-refresh capability
* Mobile-responsive design

![Deployment Dashboard](https://github.com/user-attachments/assets/32df0176-456a-4eec-be8b-5f10f9ae19d4)

## 👩🏽‍💻 Author

Nafisah — [Medium](https://medium.com/@nafisahabidemiabdulkadir)
