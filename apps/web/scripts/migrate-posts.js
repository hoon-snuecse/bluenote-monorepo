// Script to migrate existing posts from JSON files to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Function to migrate research posts
async function migrateResearchPosts() {
  console.log('📚 Migrating research posts...');
  
  // First, let's check if we can access the table
  const { data: checkData, error: checkError } = await supabase
    .from('research_posts')
    .select('id')
    .limit(1);
    
  if (checkError) {
    console.error('Cannot access research_posts table:', checkError);
    console.log('Trying with RLS bypass...');
  }
  
  try {
    // Read posts from posts.js
    const postsPath = path.join(__dirname, '../data/posts.js');
    const postsContent = fs.readFileSync(postsPath, 'utf8');
    
    // Extract the array from the JavaScript file
    const postsMatch = postsContent.match(/export const postsData = (\[[\s\S]*\]);/);
    if (!postsMatch) {
      console.error('Could not parse posts.js');
      return;
    }
    
    // Parse the posts array
    const posts = eval(postsMatch[1]);
    
    for (const post of posts) {
      // Only migrate research posts
      if (post.category !== 'research') continue;
      
      const { data, error } = await supabase
        .from('research_posts')
        .insert({
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags || [],
          created_at: post.date ? new Date(post.date).toISOString() : new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error(`Error migrating research post "${post.title}":`, error);
      } else {
        console.log(`✅ Migrated research post: ${post.title}`);
      }
    }
  } catch (error) {
    console.error('Error migrating research posts:', error);
  }
}

// Function to migrate shed posts
async function migrateShedPosts() {
  console.log('🏠 Migrating shed posts...');
  
  try {
    // Read shed posts
    const shedPostsPath = path.join(__dirname, '../data/shed-posts.json');
    const shedPosts = JSON.parse(fs.readFileSync(shedPostsPath, 'utf8'));
    
    for (const post of shedPosts) {
      // Extract base64 images if any
      const imageMatches = post.content.match(/data:image\/[^;]+;base64,[^"]+/g) || [];
      
      // Remove base64 images from content
      let cleanContent = post.content;
      imageMatches.forEach(base64 => {
        cleanContent = cleanContent.replace(base64, '[이미지]');
      });
      
      const { data: postData, error: postError } = await supabase
        .from('shed_posts')
        .insert({
          title: post.title,
          content: cleanContent,
          mood: post.mood || '평온한',
          weather: post.weather || '맑음',
          music: post.music || '',
          category: post.category || 'daily',
          tags: post.tags || [],
          created_at: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString()
        })
        .select()
        .single();
        
      if (postError) {
        console.error(`Error migrating shed post "${post.title}":`, postError);
      } else {
        console.log(`✅ Migrated shed post: ${post.title}`);
        
        // Save images separately (for future implementation)
        if (imageMatches.length > 0) {
          console.log(`   Note: ${imageMatches.length} images found in post - manual upload needed`);
        }
      }
    }
  } catch (error) {
    console.error('Error migrating shed posts:', error);
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting migration...\n');
  
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    return;
  }
  
  await migrateResearchPosts();
  console.log('');
  await migrateShedPosts();
  
  console.log('\n✨ Migration complete!');
  console.log('\nNote: Base64 images in posts need to be manually uploaded to Supabase Storage.');
}

// Run migration
migrate().catch(console.error);