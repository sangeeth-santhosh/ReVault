# ReVault

ReVault is a full-stack web application for B2B inventory sharing with approval-based access, secure transactions, and direct business communication.

## Overview
- Businesses register and require admin approval
- Approved businesses can post and request inventory
- Requests follow a controlled lifecycle
- Direct B2B chat is available
- Admin manages users, inventory, and transactions

## Core Features
- Business registration with approval workflow
- JWT-based authentication and role-based access
- Inventory management with quantity, condition, expiry, images, and description
- Inventory requests with owner approval or rejection
- Automatic transaction creation and quantity updates
- Direct business-to-business chat
- Admin dashboard for system control and monitoring
- Inventory and transaction reports

## Tech Stack
**Frontend:** React, Vite, React Router, Context API, Tailwind CSS  
**Backend:** Node.js, Express.js (REST APIs)  
**Database:** MongoDB, Mongoose  

## Security
- JWT authentication
- bcrypt password hashing
- Protected routes and role-restricted APIs
- Server-side validation

## Architecture
- Modular React frontend with protected dashboards
- Separate admin interface
- Backend with routes, controllers, models, and middleware

## Setup
1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Run frontend and backend

## Status
Fully functional and actively maintained.
