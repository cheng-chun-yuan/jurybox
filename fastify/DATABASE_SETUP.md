# Database Setup Guide

## Prerequisites

- MySQL 8.0 or higher
- Database credentials with CREATE, INSERT, UPDATE, DELETE privileges

## Step 1: Create Database

```bash
mysql -u root -p -e "CREATE DATABASE jurybox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
```

## Step 2: Import Schema

```bash
mysql -u root -p jurybox < lib/db/schema.sql
```

This will create the following tables:
- `judges` - AI judge profiles
- `orchestrators` - Multi-agent orchestrator systems
- `orchestrator_judges` - Many-to-many relationship
- `agents` - Individual agents within orchestrators
- `evaluations` - Content evaluation records
- `evaluation_judgments` - Individual judge scores and feedback

## Step 3: Verify Installation

```sql
USE jurybox;
SHOW TABLES;
SELECT * FROM judges;
```

You should see 5 default judges inserted:
1. Dr. Alex Chen (Technical)
2. Prof. Sarah Martinez (Academic)
3. James Wilson (Creative)
4. Maria Rodriguez (Business)
5. Dr. Emily Thompson (Data Science)

## Environment Configuration

Add to your `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jurybox
```

## Using the Database Models

The database models are already implemented in `/lib/db/`:

```typescript
// Import in your Fastify routes
import { JudgesModel, OrchestratorsModel, AgentsModel } from '../../lib/db/models'

// Example: Get all judges
const judges = await JudgesModel.findAll()

// Example: Create orchestrator
await OrchestratorsModel.create({
  id: 'orch_123',
  name: 'My Orchestrator',
  // ... other fields
})
```

## Database Connection

The connection pool is managed in `/lib/db/client.ts`:

```typescript
import { query, execute, transaction } from '../../lib/db/client'

// Simple query
const results = await query('SELECT * FROM judges WHERE id = ?', [1])

// Insert/Update/Delete
await execute('UPDATE judges SET rating = ? WHERE id = ?', [4.9, 1])

// Transaction
await transaction(async (connection) => {
  await connection.execute('INSERT INTO ...')
  await connection.execute('UPDATE ...')
})
```

## Production Considerations

1. **Connection Pooling**: The default pool size is 10. Adjust in `lib/db/client.ts`:
   ```typescript
   connectionLimit: 20
   ```

2. **Indexes**: The schema includes indexes on frequently queried columns:
   - `user_address` for filtering orchestrators by user
   - `status` for filtering active/inactive records
   - `wallet_account_id` for wallet lookups

3. **Backups**: Set up regular database backups:
   ```bash
   mysqldump -u root -p jurybox > backup_$(date +%Y%m%d).sql
   ```

4. **Monitoring**: Monitor connection pool usage:
   ```typescript
   const pool = getPool()
   console.log('Pool connections:', pool.pool._allConnections.length)
   ```

## Migration Strategy

For schema changes, create migration files:

```sql
-- migrations/001_add_hcs_topic.sql
ALTER TABLE orchestrators ADD COLUMN hcs_topic_id VARCHAR(255);
```

Apply migrations:
```bash
mysql -u root -p jurybox < migrations/001_add_hcs_topic.sql
```
