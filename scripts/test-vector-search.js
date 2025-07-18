require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testVectorDatabase() {
  console.log('🔍 Testing vector database functionality...')
  
  try {
    // Test 1: Get all SYO guide chunks
    const { data: allData, error: allError } = await supabase
      .from('landscaping_knowledge')
      .select('domain, topic, priority_score')
      .eq('source_document', 'syo-lawn-care-guide')
      .order('priority_score', { ascending: false })
    
    if (allError) {
      console.error('❌ Error fetching data:', allError)
      return
    }
    
    console.log('✅ Successfully retrieved', allData.length, 'chunks from SYO guide')
    
    // Show domain distribution
    const domainCounts = allData.reduce((acc, item) => {
      acc[item.domain] = (acc[item.domain] || 0) + 1
      return acc
    }, {})
    
    console.log('📈 Domain distribution:', domainCounts)
    
    // Test 2: Show high-priority content
    console.log('\n🔥 High-priority content (8+ priority):')
    const highPriority = allData.filter(item => item.priority_score >= 8)
    highPriority.forEach(item => {
      console.log(`- [${item.domain}] ${item.topic} (Priority: ${item.priority_score})`)
    })
    
    // Test 3: Get pricing information specifically
    const { data: pricingData, error: pricingError } = await supabase
      .from('landscaping_knowledge')
      .select('content, topic, priority_score')
      .eq('domain', 'pricing')
      .eq('source_document', 'syo-lawn-care-guide')
    
    if (!pricingError && pricingData.length > 0) {
      console.log('\n💰 Pricing knowledge samples:')
      pricingData.forEach((item, index) => {
        console.log(`${index + 1}. ${item.topic} (Priority: ${item.priority_score})`)
        console.log(`   Preview: ${item.content.substring(0, 150)}...`)
        console.log('')
      })
    }
    
    // Test 4: Verify embeddings exist
    const { data: embeddingTest, error: embeddingError } = await supabase
      .from('landscaping_knowledge')
      .select('id, embedding')
      .eq('source_document', 'syo-lawn-care-guide')
      .limit(1)
    
    if (!embeddingError && embeddingTest.length > 0) {
      const hasEmbedding = embeddingTest[0].embedding !== null
      console.log('🧠 Embeddings status:', hasEmbedding ? '✅ Present' : '❌ Missing')
      if (hasEmbedding) {
        const embeddingLength = embeddingTest[0].embedding.split(',').length
        console.log('   Embedding dimensions:', embeddingLength)
      }
    }
    
    console.log('\n🎉 Vector database test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testVectorDatabase()