require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createKnowledgeTable() {
  console.log('🔧 Creating landscaping_knowledge table...')
  
  try {
    // Create the table using direct SQL
    const { error } = await supabase.from('landscaping_knowledge').select('*').limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ Table does not exist, this is expected. Creating through Supabase dashboard...')
      
      // Since we can't create tables directly via client, let's create a simpler approach
      // by inserting test data which will help us understand what works
      
      console.log('🔄 The table needs to be created through the Supabase dashboard')
      console.log('📋 Please run this SQL in your Supabase SQL editor:')
      console.log(`
CREATE TABLE landscaping_knowledge (
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

-- Create indexes
CREATE INDEX landscaping_knowledge_embedding_idx ON landscaping_knowledge USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX landscaping_knowledge_domain_idx ON landscaping_knowledge (domain);
CREATE INDEX landscaping_knowledge_region_idx ON landscaping_knowledge (region);
      `)
      
      return
    }
    
    if (error) {
      console.error('❌ Error checking table:', error)
      return
    }
    
    console.log('✅ Table exists and is accessible')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

createKnowledgeTable()