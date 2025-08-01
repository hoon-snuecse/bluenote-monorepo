import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
config({ path: join(__dirname, '..', '.env.local') });

import { createAdminClient } from '../lib/supabase/admin.js';

async function fixBrowserInfo() {
  console.log('Fixing browser info for hoon@iw.es.kr...');
  
  try {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('user_daily_stats')
      .update({
        last_device: 'Desktop',
        last_browser: 'Chrome',
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_email', 'hoon@iw.es.kr')
      .eq('date', today);
    
    if (error) {
      console.error('Error updating:', error);
    } else {
      console.log('Successfully updated to Desktop/Chrome');
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixBrowserInfo();