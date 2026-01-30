// utils/db.ts
import { sql } from '@vercel/postgres'

export const getTokens = async () => {
  return await sql`SELECT * FROM tokens LIMIT 1` // Fetch tokens from your tokens table
}

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  // Upsert tokens into your tokens table
  return await sql`
    INSERT INTO tokens (access_token, refresh_token) 
    VALUES (${accessToken}, ${refreshToken}) 
    ON CONFLICT (id) DO UPDATE SET access_token = ${accessToken}, refresh_token = ${refreshToken}`
}
