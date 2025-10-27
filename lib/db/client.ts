import mysql from 'mysql2/promise'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jurybox',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Query helper
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const connection = await getPool().getConnection()
  try {
    const [rows] = await connection.execute(sql, params)
    return rows as T[]
  } finally {
    connection.release()
  }
}

// Execute helper (for INSERT, UPDATE, DELETE)
export async function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
  const connection = await getPool().getConnection()
  try {
    const [result] = await connection.execute(sql, params)
    return result as mysql.ResultSetHeader
  } finally {
    connection.release()
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getPool().getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Close pool
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
