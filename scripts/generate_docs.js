const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');
const githubDir = path.join(__dirname, '../.github');
const rootDir = path.join(__dirname, '..');

const docs = {
    'PRD.md': `# Product Requirements Document (PRD)\n\n## Overview\nEduSaaS is an education SaaS portal providing role-based access for Admins, Faculty, Students, and Parents.\n\n## Goals\n- Streamline institute operations.\n- Automate certificate generation.\n- Provide Zoom integration for online classes.`,
    'TRD.md': `# Technical Requirements Document (TRD)\n\n## Tech Stack\n- **Frontend**: Next.js 15, React 19, Tailwind CSS, Radix UI\n- **Backend**: Node.js, Express\n- **Database**: PostgreSQL (planned)\n\n## Key Technical Decisions\n- Use Server Components where possible for performance.\n- JWT for stateless authentication.`,
    'ARCHITECTURE.md': `# System Architecture\n\n\`\`\`mermaid\ngraph TD\n    Client(Web Browser) --> Frontend(Next.js App)\n    Frontend --> API(Backend API Express)\n    API --> DB[(PostgreSQL)]\n    API --> Zoom(Zoom API)\n    API --> Razorpay(Razorpay Gateway)\n\`\`\`\n\n## Components\n- **Frontend**: App router, Tailwind styling.\n- **Backend**: RESTful API endpoints.\n- **Database**: Relational data model for users and courses.`,
    'API.md': `# API Documentation\n\n## Endpoints\n\n### \`GET /api/health\`\nReturns API health status.\n- **Response**: \`{ "status": "ok", "message": "..." }\`\n`,
    'DATABASE.md': `# Database Schema\n\n\`\`\`mermaid\nerDiagram\n    USER ||--o{ ROLE : has\n    USER {\n        uuid id PK\n        string email\n        string name\n        string password_hash\n    }\n    ROLE {\n        uuid id PK\n        string role_name\n    }\n\`\`\`\n`,
    'AGENTS.md': `# Agents Architecture\n\nDocumentation for any AI Agents integrated in the future. (Placeholder)`,
    'RAG.md': `# RAG Workflow\n\nRetrieval-Augmented Generation workflows (Placeholder).`,
    'DEPLOYMENT.md': `# Deployment Guide\n\n## Frontend\nDeploy via Vercel:\n\`\`\`bash\nnpx vercel --prod\n\`\`\`\n\n## Backend\nDeploy via Docker / AWS ECS / Render.\n`,
    'TESTING.md': `# Testing Strategy\n\n- **Unit Tests**: Jest / React Testing Library\n- **E2E Tests**: Cypress / Playwright\n`,
    'SECURITY.md': `# Security Overview\n\n- HTTPS only in production.\n- Passwords hashed with bcrypt.\n- Rate limiting applied to API endpoints.\n- Helmet.js for secure HTTP headers.`,
    'SCALING.md': `# Scaling Strategy\n\n- Stateless backend for horizontal scaling.\n- CDN for frontend static assets.\n- Database read replicas for heavy read loads.`,
    'WORKFLOW.md': `# Developer Workflow\n\n1. Branch from \`main\`.\n2. Develop feature.\n3. Create PR.\n4. CI runs tests and linting.\n5. Merge upon approval.`,
    'FEATURES.md': `# Features List\n\n- Role-based Dashboard\n- Certificate Generation\n- Payment Gateway (Razorpay)\n- Live Classes (Zoom)`,
    'USER_FLOW.md': `# User Flow\n\n1. User visits landing page.\n2. Signs in based on role.\n3. Redirected to specific dashboard (Admin, Faculty, Student, Parent).`,
    'BUSINESS_PLAN.md': `# Business Plan & Explanation\n\n## Problem Statement\nManaging educational institutes involves fragmented tools for fees, classes, and certificates.\n\n## Solution\nEduSaaS unifies these into one platform.\n\n## Target Users\nSchools, Colleges, and Private Tutors.`
};

const githubDocs = {
    'CONTRIBUTING.md': `# Contributing to EduSaaS\n\nThank you for investing your time in contributing to our project!`,
    'CODE_OF_CONDUCT.md': `# Contributor Covenant Code of Conduct\n\nWe pledge to make participation in our project and our community a harassment-free experience for everyone.`,
    'CHANGELOG.md': `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n## [Unreleased]\n- Initial repository overhaul.`,
    'SECURITY.md': `# Security Policy\n\n## Supported Versions\nOnly the latest version is supported.\n\n## Reporting a Vulnerability\nPlease email security@example.com.`
};

const templates = {
    'ISSUE_TEMPLATE/bug_report.md': `---\nname: Bug report\nabout: Create a report to help us improve\ntitle: ''\nlabels: bug\nassignees: ''\n---\n\n**Describe the bug**\nA clear and concise description of what the bug is.`,
    'ISSUE_TEMPLATE/feature_request.md': `---\nname: Feature request\nabout: Suggest an idea for this project\ntitle: ''\nlabels: enhancement\nassignees: ''\n---\n\n**Is your feature request related to a problem?**\nA clear description of what the problem is.`,
    'pull_request_template.md': `## Description\n\nProvide a brief description of the changes.`
};

const rootDocs = {
    'LICENSE': `MIT License\n\nCopyright (c) 2026 Saif Ur Rahman\n\nPermission is hereby granted...`,
    'README.md': `# EduSaaS - Enterprise Education Platform\n\n[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)\n\n## Overview\nEduSaaS is a modern, feature-rich Next.js education portal with customized workflows for Admin, Faculty, Student, and Parent roles.\n\n## Features\n- 🎓 Certificate Generation\n- 💳 Razorpay Payments\n- 📹 Zoom Integration\n- 📊 Role-based Dashboards\n\n## Tech Stack\n- **Frontend**: Next.js 15, React, Tailwind CSS\n- **Backend**: Node.js, Express\n\n## Quick Start\n\`\`\`bash\n# Frontend\ncd frontend\nnpm install\nnpm run dev\n\n# Backend\ncd backend\nnpm install\nnpm run dev\n\`\`\`\n\n## Documentation\nSee the \`docs/\` folder for architectural and technical details.`
};

function writeFiles(dir, files) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    for (const [name, content] of Object.entries(files)) {
        const fullPath = path.join(dir, name);
        const dirname = path.dirname(fullPath);
        if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
        fs.writeFileSync(fullPath, content);
    }
}

writeFiles(docsDir, docs);
writeFiles(rootDir, rootDocs);
writeFiles(githubDir, githubDocs);
writeFiles(githubDir, templates);

console.log('Successfully generated all documentation files.');
