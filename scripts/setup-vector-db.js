require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupVectorDatabase() {
  console.log('🔧 Setting up vector database...')
  
  try {
    // Enable pgvector extension
    console.log('📦 Enabling pgvector extension...')
    const { error: extensionError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS vector;'
    })
    
    if (extensionError) {
      console.error('❌ Extension error:', extensionError)
    } else {
      console.log('✅ pgvector extension enabled')
    }
    
    // Create the knowledge table
    console.log('🗄️ Creating landscaping_knowledge table...')
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
      console.error('❌ Table creation error:', tableError)
    } else {
      console.log('✅ landscaping_knowledge table created')
    }
    
    // Create vector similarity index
    console.log('🔍 Creating vector similarity index...')
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS landscaping_knowledge_embedding_idx 
      ON landscaping_knowledge USING ivfflat (embedding vector_cosine_ops);
    `
    
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSQL })
    
    if (indexError) {
      console.error('❌ Index creation error:', indexError)
    } else {
      console.log('✅ Vector similarity index created')
    }
    
    // Create metadata indexes
    console.log('📊 Creating metadata indexes...')
    const metadataIndexes = [
      'CREATE INDEX IF NOT EXISTS landscaping_knowledge_domain_idx ON landscaping_knowledge (domain);',
      'CREATE INDEX IF NOT EXISTS landscaping_knowledge_topic_idx ON landscaping_knowledge (topic);',
      'CREATE INDEX IF NOT EXISTS landscaping_knowledge_region_idx ON landscaping_knowledge (region);',
      'CREATE INDEX IF NOT EXISTS landscaping_knowledge_stage_idx ON landscaping_knowledge (business_stage);'
    ]
    
    for (const indexSql of metadataIndexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSql })
      if (error) {
        console.error('❌ Metadata index error:', error)
      }
    }
    
    console.log('✅ Metadata indexes created')
    
    // Test with sample data
    console.log('🧪 Inserting test knowledge chunk...')
    const { error: insertError } = await supabase
      .from('landscaping_knowledge')
      .insert({
        content: 'Most landscaping businesses achieve 15-20% net profit margins on projects. Industry averages range from 5-20%, with top operators maintaining higher margins through efficient operations and proper pricing. For new businesses, 10% margins may be acceptable initially, but strive upward as operations stabilize.',
        domain: 'pricing',
        topic: 'profit-margins',
        content_type: 'strategy',
        region: 'general',
        business_stage: 'all',
        source_document: 'landscaping_playbook_gpt',
        section_reference: 'section-2',
        keywords: ['profit', 'margins', 'pricing', 'industry-average'],
        priority_score: 8
      })
    
    if (insertError) {
      console.error('❌ Test insert error:', insertError)
    } else {
      console.log('✅ Test knowledge chunk inserted')
    }
    
    console.log('🎉 Vector database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

setupVectorDatabase()