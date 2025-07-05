Project Brief: SA Budget Queen (SABQ2025cloud)
1. High-Level Overview
Project Statement:
A personal budgeting web application specifically designed for middle-aged South Africans facing economic pressures. [cite: PLANNING.md]

Core Mission:
To empower individuals and families to achieve financial freedom through smart budgeting, practical education, and community support, ultimately helping them "live like royalty on any budget". [cite: PLANNING.md]

2. Core Requirements & Goals
Functional Requirements
User Registration & Profile Setup: Includes SA ID validation, income/expense categorization, and financial goal setting.

Budget Creation & Management: A multi-step wizard to create an initial budget with template-based setup and goal-based allocation.

Expense Tracking: Manual entry with receipt capture and automatic categorization.

Basic Reporting and Analytics: Monthly budget vs. actual reports, category breakdowns, and simple trend analysis.

Non-Functional Requirements
Performance: Page load time must be under 2 seconds on a 3G connection. [cite: PLANNING.md]

Security: Must be compliant with POPIA. All sensitive data must be encrypted at rest (AES-256) and in transit (TLS 1.3). [cite: PLANNING.md, TECHSTACK.md]

Scalability: The system is built on serverless Google Cloud Run services to handle variable traffic loads.

Usability: Must be mobile-first and intuitive for non-technical users. [cite: PLANNING.md]

3. Scope
In Scope
A Progressive Web Application (PWA) with offline capabilities. [cite: PLANNING.md]

Manual expense entry and a template-based budget creation wizard for the MVP. [cite: PLANNING.md]

A backend API built with Express.js and a PostgreSQL database managed by Prisma. [cite: TECHSTACK.md]

Deployment to Google Cloud Run. [cite: PLANNING.md]

Out of Scope
Phase 1 (MVP): Direct bank account integration, AI-powered predictive budgeting, and multi-language support are out of scope for the initial release. [cite: PLANNING.md]

This document is the primary source of truth for the project's scope and goals. It should be manually maintained by the development team.