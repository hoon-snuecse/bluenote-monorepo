import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { getServerSession } from '@/lib/auth';

// 간단한 암호화 (실제 환경에서는 더 안전한 방법 사용)
const encrypt = (text: string): string => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text: string): string => {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const [ivHex, encrypted] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    return '';
  }
};

export async function GET() {
  try {
    // 인증 및 관리자 권한 체크
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 관리자 권한 체크 (필요시 활성화)
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: '관리자 권한이 필요합니다.' },
    //     { status: 403 }
    //   );
    // }
    // 모든 설정 조회
    const settingsRecords = await prisma.systemSettings.findMany();
    
    // 설정을 객체 형태로 변환
    const settings = {
      apiKeys: {},
      schoolInfo: {
        schoolName: '',
        defaultGrade: ''
      },
      evaluationDefaults: {
        defaultLevelCount: 4,
        defaultDomains: []
      }
    };
    
    // 각 설정 레코드를 객체에 매핑
    for (const record of settingsRecords) {
      if (record.key === 'apiKeys' && record.value) {
        const apiKeys = record.value as any;
        // API 키는 마스킹 처리하여 전송
        if (apiKeys.claudeApiKey) {
          const decrypted = decrypt(apiKeys.claudeApiKey);
          apiKeys.claudeApiKey = decrypted ? `${decrypted.substring(0, 10)}...` : '';
        }
        if (apiKeys.openaiApiKey) {
          const decrypted = decrypt(apiKeys.openaiApiKey);
          apiKeys.openaiApiKey = decrypted ? `${decrypted.substring(0, 10)}...` : '';
        }
        settings.apiKeys = apiKeys;
      } else if (record.key === 'schoolInfo' && record.value) {
        settings.schoolInfo = record.value as any;
      } else if (record.key === 'evaluationDefaults' && record.value) {
        settings.evaluationDefaults = record.value as any;
      }
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('설정 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '설정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 인증 및 관리자 권한 체크
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 관리자 권한 체크
    // TODO: session.user.role 확인 후 활성화
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: '관리자 권한이 필요합니다.' },
    //     { status: 403 }
    //   );
    // }
    
    const settings = await request.json();
    
    // API 키 설정 처리
    if (settings.apiKeys) {
      const apiKeysToSave = { ...settings.apiKeys };
      // API 키 암호화
      if (apiKeysToSave.claudeApiKey) {
        apiKeysToSave.claudeApiKey = encrypt(apiKeysToSave.claudeApiKey);
      }
      if (apiKeysToSave.openaiApiKey) {
        apiKeysToSave.openaiApiKey = encrypt(apiKeysToSave.openaiApiKey);
      }
      
      await prisma.systemSettings.upsert({
        where: { key: 'apiKeys' },
        update: { value: apiKeysToSave },
        create: { key: 'apiKeys', value: apiKeysToSave }
      });
    }
    
    // 학교 정보 설정 처리
    if (settings.schoolInfo) {
      await prisma.systemSettings.upsert({
        where: { key: 'schoolInfo' },
        update: { value: settings.schoolInfo },
        create: { key: 'schoolInfo', value: settings.schoolInfo }
      });
    }
    
    // 평가 기본값 설정 처리
    if (settings.evaluationDefaults) {
      await prisma.systemSettings.upsert({
        where: { key: 'evaluationDefaults' },
        update: { value: settings.evaluationDefaults },
        create: { key: 'evaluationDefaults', value: settings.evaluationDefaults }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('설정 저장 오류:', error);
    return NextResponse.json(
      { success: false, error: '설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}