import { sql } from '@vercel/postgres'

export default async function handler(req, res) {
  try {
    const r = await sql`select now() as ts`
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ ts: r.rows[0].ts, host: process.env.PGHOST })
  } catch (error) {
    console.error('DB Debug Error:', error)
    res.setHeader('Cache-Control', 'no-store')
    res.status(500).json({ error: error.message })
  }
}