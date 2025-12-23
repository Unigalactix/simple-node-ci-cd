# Simple Node.js CI/CD 

This project demonstrates a deployment-ready Node.js application with a comprehensive CI/CD pipeline using GitHub Actions and Docker.

## 🚀 Features

* **Deployment Dashboard UI** - Real-time web interface displaying:
  * Current dependency versions (production & development)
  * Last commit information (hash, message, timestamp)
  * Deployment status and environment details
  * Auto-refreshing every 30 seconds
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
* Docker Hub account (for CI/CD)
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
* `GET /api/dependencies` - Returns current dependency versions
* `GET /api/last-commit` - Returns last commit information
* `GET /api/deployment-status` - Returns deployment status and metadata

### Example API Responses

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
docker build -t your-dockerhub-username/simple-node-ci-cd .
```

## 🧬 CI/CD Pipeline

The pipeline is configured in `.github/workflows/ci-cd.yml`. It automatically:

* Checks out code with full git history
* Installs dependencies
* Runs comprehensive tests
* Performs code linting
* Generates deployment metadata (timestamp, status, build info)
* Builds Docker image
* Pushes to Docker Hub
* Tracks deployment status (success/failure)

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

* `DOCKER_USERNAME` - Your Docker Hub username
* `DOCKER_PASSWORD` - Your Docker Hub password or access token

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
