# Fastify Backend Implementation Guide

This directory contains implementation guides for the Fastify backend server that powers JuryBox.

## Overview

The backend is a Fastify server that handles:
- **Judges**: Managing AI judge profiles and configurations
- **Orchestrators**: Creating and managing multi-agent orchestrator systems
- **Agents**: Individual AI agents within orchestrator systems
- **Evaluations**: Processing content evaluations with consensus mechanisms

## Database Setup

The database schema is located in `/lib/db/schema.sql`. Set up your MySQL database:

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE jurybox"

# Import schema
mysql -u root -p jurybox < lib/db/schema.sql
```

## Environment Variables

Add these to your backend `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jurybox

# Server
PORT=10000
HOST=0.0.0.0

# Hedera
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=your_operator_id
HEDERA_OPERATOR_KEY=your_operator_key

# Encryption
ENCRYPTION_KEY=your_32_byte_encryption_key

# AI
OPENAI_API_KEY=your_openai_key
```

## Implementation Guides

1. [Database Models](./DATABASE_MODELS.md) - TypeScript models for database operations
2. [Judges API](./JUDGES_API.md) - Endpoints for managing judges
3. [Orchestrators API](./ORCHESTRATORS_API.md) - Endpoints for orchestrator systems
4. [Agents API](./AGENTS_API.md) - Endpoints for managing agents
5. [Evaluations API](./EVALUATIONS_API.md) - Endpoints for content evaluation

## Quick Start

1. Install dependencies:
```bash
npm install fastify @fastify/cors mysql2 nanoid
```

2. Create Fastify server structure:
```
backend/
├── src/
│   ├── server.ts          # Main Fastify server
│   ├── routes/
│   │   ├── judges.ts
│   │   ├── orchestrators.ts
│   │   ├── agents.ts
│   │   └── evaluations.ts
│   └── services/
│       ├── database.ts
│       ├── hedera.ts
│       └── encryption.ts
└── package.json
```

3. Implement routes following the API guides in this directory.

## Database Models Location

All database models are already implemented in:
- `/lib/db/client.ts` - Database connection and query helpers
- `/lib/db/models.ts` - Model functions for all tables
- `/lib/db/types.ts` - TypeScript type definitions

You can import and use these in your Fastify routes.
