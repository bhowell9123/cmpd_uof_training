import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'
import { readFile } from 'node:fs/promises'
const mappingPath = new URL('../assets/content_mapping/content_mapping.json', import.meta.url)
const contentMapping = JSON.parse(await readFile(mappingPath, 'utf8'))

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `

    // Create slides table
    await sql`
      CREATE TABLE IF NOT EXISTS slides (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        content JSONB NOT NULL,
        images TEXT[],
        module_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        updated_by INTEGER REFERENCES users(id)
      )
    `

    // Create audit logs table
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        slide_id INTEGER,
        action VARCHAR(50) NOT NULL,
        changes JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `

    // Create modules table
    await sql`
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        slide_start INTEGER,
        slide_end INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    console.log('Database tables created successfully')
    return true
  } catch (error) {
    console.error('Error creating database tables:', error)
    return false
  }
}

// Seed initial data
export async function seedDatabase() {
  try {
    // Check if users already exist
    const existingUsers = await sql`SELECT COUNT(*) FROM users`
    if (existingUsers.rows[0].count > 0) {
      console.log('Database already seeded')
      return true
    }

    // Create default users
    const adminPassword = await bcrypt.hash('admin123', 10)
    const editorPassword = await bcrypt.hash('editor123', 10)
    const reviewerPassword = await bcrypt.hash('reviewer123', 10)

    await sql`
      INSERT INTO users (username, email, password_hash, role, name) VALUES
      ('admin', 'admin@capemaypd.gov', ${adminPassword}, 'super_admin', 'System Administrator'),
      ('editor', 'editor@capemaypd.gov', ${editorPassword}, 'content_editor', 'Content Editor'),
      ('reviewer', 'reviewer@capemaypd.gov', ${reviewerPassword}, 'content_reviewer', 'Content Reviewer')
    `

    // Insert modules
    await sql`
      INSERT INTO modules (id, name, description, slide_start, slide_end) VALUES
      (1, 'Core Principles', 'Introduction to the core principles of use of force', 1, 15),
      (2, 'Definitions and Classifications', 'Key definitions and classifications related to use of force', 16, 30),
      (3, 'Procedures and Techniques', 'Practical procedures and techniques for use of force situations', 31, 38),
      (4, 'Specific Force Options', 'Detailed information on specific force options available to officers', 39, 46),
      (5, 'Post-Incident Procedures', 'Procedures to follow after a use of force incident', 47, 49)
    `

    // Insert slides from content mapping
    for (const [slideKey, slideData] of Object.entries(contentMapping)) {
      const slideId = parseInt(slideKey.replace('slide_', ''))
      const moduleId = getModuleIdForSlide(slideId)
      
      await sql`
        INSERT INTO slides (id, title, content, images, module_id) VALUES
        (${slideId}, ${slideData.title}, ${JSON.stringify(slideData.textContent)}, ${slideData.images || []}, ${moduleId})
      `
    }

    console.log('Database seeded successfully')
    return true
  } catch (error) {
    console.error('Error seeding database:', error)
    return false
  }
}

// Helper function to determine module ID for a slide
function getModuleIdForSlide(slideId) {
  if (slideId >= 1 && slideId <= 15) return 1
  if (slideId >= 16 && slideId <= 30) return 2
  if (slideId >= 31 && slideId <= 38) return 3
  if (slideId >= 39 && slideId <= 46) return 4
  if (slideId >= 47 && slideId <= 49) return 5
  return 1
}

// User management functions
export async function getUserByUsername(username) {
  try {
    const result = await sql`
      SELECT id, username, email, role, name, created_at, last_login
      FROM users 
      WHERE username = ${username}
    `
    return result.rows[0] || null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getUserWithPassword(username) {
  try {
    const result = await sql`
      SELECT id, username, email, password_hash, role, name
      FROM users 
      WHERE username = ${username}
    `
    return result.rows[0] || null
  } catch (error) {
    console.error('Error getting user with password:', error)
    return null
  }
}

export async function updateUserLastLogin(userId) {
  try {
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${userId}
    `
    return true
  } catch (error) {
    console.error('Error updating last login:', error)
    return false
  }
}

// Slide management functions
export async function getAllSlides() {
  try {
    const result = await sql`
      SELECT s.*, m.name as module_name, u.username as updated_by_username
      FROM slides s
      LEFT JOIN modules m ON s.module_id = m.id
      LEFT JOIN users u ON s.updated_by = u.id
      ORDER BY s.id
    `
    return result.rows
  } catch (error) {
    console.error('Error getting slides:', error)
    return []
  }
}

export async function getSlideById(slideId) {
  try {
    const result = await sql`
      SELECT s.*, m.name as module_name, u.username as updated_by_username
      FROM slides s
      LEFT JOIN modules m ON s.module_id = m.id
      LEFT JOIN users u ON s.updated_by = u.id
      WHERE s.id = ${slideId}
    `
    return result.rows[0] || null
  } catch (error) {
    console.error('Error getting slide:', error)
    return null
  }
}

export async function updateSlide(slideId, title, content, images, userId) {
  console.log(`[DB] Updating slide ${slideId} with title: ${title}, content length: ${Array.isArray(content) ? content.length : 'N/A'}, images length: ${Array.isArray(images) ? images.length : 'N/A'}, userId: ${userId}`)
  
  try {
    const result = await sql`
      UPDATE slides
      SET title = ${title},
          content = ${JSON.stringify(content)},
          images = ${images || []},
          updated_at = NOW(),
          updated_by = ${userId}
      WHERE id = ${slideId}
      RETURNING *
    `
    
    console.log(`[DB] Slide update result:`, result.rows[0] ? `Success, updated slide ${slideId}` : 'No slide updated')
    
    // Log the change
    await logAuditAction(userId, slideId, 'update_slide', {
      title,
      content,
      images
    })
    
    return result.rows[0] || null
  } catch (error) {
    console.error('Error updating slide:', error)
    return null
  }
}

// Module management functions
export async function getAllModules() {
  try {
    const result = await sql`
      SELECT * FROM modules ORDER BY id
    `
    return result.rows
  } catch (error) {
    console.error('Error getting modules:', error)
    return []
  }
}

// Audit logging
export async function logAuditAction(userId, slideId, action, changes) {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, slide_id, action, changes)
      VALUES (${userId}, ${slideId}, ${action}, ${JSON.stringify(changes)})
    `
    return true
  } catch (error) {
    console.error('Error logging audit action:', error)
    return false
  }
}

export async function getAuditLogs(limit = 50) {
  try {
    const result = await sql`
      SELECT a.*, u.username, u.name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.timestamp DESC
      LIMIT ${limit}
    `
    return result.rows
  } catch (error) {
    console.error('Error getting audit logs:', error)
    return []
  }
}
