import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * 인증 확인 헬퍼
 * @param {string|null} requiredRole - 'admin', 'write', or null
 * @returns {Promise<{session?: any, error?: {message: string, status: number}}>}
 */
export async function requireAuth(requiredRole = null) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return { error: { message: 'Unauthorized', status: 401 } };
  }
  
  if (requiredRole === 'admin' && !session.user.isAdmin) {
    return { error: { message: 'Forbidden - Admin access required', status: 403 } };
  }
  
  if (requiredRole === 'write' && !session.user.isAdmin && !session.user.canWrite) {
    return { error: { message: 'Forbidden - Admin access or write permission required', status: 403 } };
  }
  
  return { session };
}

/**
 * API 응답 생성 헬퍼
 * @param {any} data - 응답 데이터
 * @param {Object|null} error - 에러 객체
 * @param {number} status - HTTP 상태 코드
 * @returns {NextResponse}
 */
export function apiResponse(data, error = null, status = 200) {
  if (error) {
    console.error(error.message || error);
    return NextResponse.json(
      { 
        error: error.message || 'An error occurred', 
        details: process.env.NODE_ENV === 'development' ? error.details : undefined 
      },
      { status: error.status || status }
    );
  }
  return NextResponse.json(data, { status });
}

/**
 * Supabase 쿼리 래퍼
 * @param {Function} queryFn - Supabase 쿼리 함수
 * @param {string} errorMessage - 기본 에러 메시지
 * @returns {Promise<any>}
 */
export async function supabaseQuery(queryFn, errorMessage = 'Database operation failed') {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw { message: 'Resource not found', status: 404, details: error };
      }
      if (error.code === '23505') {
        throw { message: 'Resource already exists', status: 409, details: error };
      }
      throw { message: errorMessage, status: 500, details: error };
    }
    
    return data;
  } catch (error) {
    throw error.message ? error : { message: errorMessage, status: 500, details: error };
  }
}

/**
 * 통합 API 핸들러 생성
 * @param {Object} options - { requiredRole: string|null, useAdminClient: boolean }
 * @returns {Function}
 */
export function createApiHandler(options = {}) {
  const { requiredRole = null, useAdminClient = false } = options;
  
  return async function handler(request, callback) {
    try {
      // 인증 확인
      const { session, error: authError } = await requireAuth(requiredRole);
      if (authError) return apiResponse(null, authError);
      
      // Supabase 클라이언트 생성
      const supabase = useAdminClient 
        ? createAdminClient() 
        : await createClient();
      
      // 콜백 실행
      const result = await callback({ request, session, supabase });
      
      return apiResponse(result);
    } catch (error) {
      return apiResponse(null, error);
    }
  };
}

/**
 * CRUD 작업을 위한 헬퍼 함수들
 */
export const crud = {
  /**
   * 목록 조회
   */
  async list(supabase, table, options = {}) {
    const { select = '*', order = 'created_at', ascending = false, filters = {} } = options;
    
    let query = supabase.from(table).select(select);
    
    // 필터 적용
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // 정렬 적용
    if (order) {
      query = query.order(order, { ascending });
    }
    
    return supabaseQuery(
      () => query,
      `Failed to fetch ${table}`
    );
  },
  
  /**
   * 단일 항목 조회
   */
  async get(supabase, table, id, options = {}) {
    const { select = '*' } = options;
    
    return supabaseQuery(
      () => supabase.from(table).select(select).eq('id', id).single(),
      `Failed to fetch ${table} item`
    );
  },
  
  /**
   * 생성
   */
  async create(supabase, table, data, options = {}) {
    const { select = '*' } = options;
    
    return supabaseQuery(
      () => supabase.from(table).insert([data]).select(select).single(),
      `Failed to create ${table} item`
    );
  },
  
  /**
   * 수정
   */
  async update(supabase, table, id, data, options = {}) {
    const { select = '*' } = options;
    
    return supabaseQuery(
      () => supabase.from(table).update(data).eq('id', id).select(select).single(),
      `Failed to update ${table} item`
    );
  },
  
  /**
   * 삭제
   */
  async delete(supabase, table, id) {
    return supabaseQuery(
      () => supabase.from(table).delete().eq('id', id),
      `Failed to delete ${table} item`
    );
  }
};