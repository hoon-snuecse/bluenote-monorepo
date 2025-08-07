// 관리자 권한 설정 스크립트
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  const adminEmail = 'hoon@snuecse.org';
  
  try {
    // 먼저 테이블이 존재하는지 확인
    const { data: existing, error: checkError } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking permissions:', checkError);
      return;
    }
    
    if (existing) {
      // 업데이트
      const { error: updateError } = await supabase
        .from('user_permissions')
        .update({
          role: 'admin',
          can_write: true,
          claude_daily_limit: 1000,
          updated_at: new Date().toISOString()
        })
        .eq('email', adminEmail);
      
      if (updateError) {
        console.error('Error updating permissions:', updateError);
      } else {
        console.log('✅ Admin permissions updated for:', adminEmail);
      }
    } else {
      // 삽입
      const { error: insertError } = await supabase
        .from('user_permissions')
        .insert({
          email: adminEmail,
          role: 'admin',
          can_write: true,
          claude_daily_limit: 1000
        });
      
      if (insertError) {
        console.error('Error inserting permissions:', insertError);
      } else {
        console.log('✅ Admin permissions created for:', adminEmail);
      }
    }
    
    // 확인
    const { data: finalCheck, error: finalError } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (finalError) {
      console.error('Error verifying permissions:', finalError);
    } else {
      console.log('Current permissions:', finalCheck);
    }
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupAdmin();