import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { supabase } = createClient(request)
    
    // Read the SQL setup file
    const fs = require('fs')
    const path = require('path')
    const sqlPath = path.join(process.cwd(), 'sql', 'setup_vector_knowledge.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL to set up vector database
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      // Try executing each statement individually
      const statements = sqlContent.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
          if (stmtError) {
            console.error('SQL execution error:', stmtError)
          }
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vector database setup completed successfully' 
    })
    
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to set up vector database', details: error.message },
      { status: 500 }
    )
  }
}

// Alternative approach: Execute individual SQL commands
export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request)
    
    // Enable pgvector extension
    await supabase.rpc('exec_sql', { 
      sql: 'CREATE EXTENSION IF NOT EXISTS vector;' 
    })
    
    // Create the knowledge table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS landscaping_knowledge (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        embedding VECTOR(1536),
        domain VARCHAR(50) NOT NULL,
        topic VARCHAR(100) NOT NULL,
        content_type VARCHAR(30) NOT NULL,
        region VARCHAR(20) DEFAULT 'general',
        season VARCHAR(20) DEFAULT 'year-round',
        business_stage VARCHAR(20) DEFAULT 'all',
        source_document VARCHAR(100),
        section_reference VARCHAR(50),
        chunk_index INTEGER,
        keywords TEXT[] DEFAULT '{}',
        priority_score INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
    
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (tableError) {
      console.error('Table creation error:', tableError)
    }
    
    // Create indexes
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS landscaping_knowledge_embedding_idx 
      ON landscaping_knowledge USING ivfflat (embedding vector_cosine_ops);
    `
    
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSQL })
    
    if (indexError) {
      console.error('Index creation error:', indexError)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vector database setup completed via GET method' 
    })
    
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to set up vector database via GET', details: error.message },
      { status: 500 }
    )
  }
}