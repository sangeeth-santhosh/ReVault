# ReVault

Revolt is a full-stack web application that demonstrates a structured business-to-business inventory sharing system with role-based access and administrative approval workflows.  
The focus is on clean architecture, predictable data flow, and practical full-stack fundamentals.

Project Overview

- Business users register and request approval before accessing the platform
- Approved businesses can post inventory and receive requests
- Requests move through a controlled lifecycle until completion
- An admin interface manages users, inventory, and transactions

Core Modules and Features

User & Business Module
- Business registration with detailed profile information
- Approval-based access control managed by admin
- Account status handling (pending, approved, rejected, deactivated)

Authentication Module
- Secure login using token-based authentication
- Role-based route protection for users and admin
- Session persistence with controlled logout behavior

Inventory Module
- Inventory creation with quantity, condition, expiry, images, and description
- Inventory editing and status management
- Controlled visibility of active inventory items

Request & Transaction Module
- Requesting inventory with specified quantities
- Owner-side approval or rejection of requests
- Transaction records created only on approval
- Inventory quantity updated after completion

Admin Module
- Dashboard with system-level overview
- Business approval and deactivation controls
- Inventory monitoring across businesses
- Transaction and report visibility

Reporting Module
- Inventory posted summary
- Completed transactions overview
- Quantity transfer records
- Export-ready structured data

Technology Stack

Frontend
- React
- Vite
- React Router
- Context API
- Tailwind CSS

Backend
- Node.js
- Express.js
- REST-based API architecture

Database
- MongoDB
- Mongoose

Authentication & Security

- JWT-based authentication
- Password hashing with bcrypt
- Middleware-driven authorization
- Role-restricted API endpoints
- Server-side validation of critical actions

High-Level Project Structure

Frontend
- Public pages for browsing and authentication
- Protected user dashboard with modular pages
- Dedicated admin interface with isolated layout
- Centralized API and authentication handling

Backend
- Modular routes and controllers
- Schema-based data models
- Authentication and validation middleware
- Clear separation of concerns

Installation & Setup

- Clone the repository
- Install dependencies using npm
- Run backend and frontend in development mode
- Configure environment variables for local setup

Purpose and Learning Outcomes

- Building approval-based user workflows
- Designing role-driven application architecture
- Managing state across protected routes
- Structuring scalable React and Node.js projects
- Applying real-world authentication and authorization patterns

Project Status

Feature-complete for demonstration and evaluation.  
Designed for further refinement, testing, and incremental improvements.
