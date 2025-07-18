import Redis from 'redis'

// 공통 Redis 클라이언트
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

redisClient.on('error', (err) => console.error('Redis Client Error', err))
redisClient.connect()

// 캐시 매니저
export class CacheManager {
  private prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await redisClient.get(this.getKey(key))
    return data ? JSON.parse(data) : null
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await redisClient.setEx(this.getKey(key), ttl, serialized)
    } else {
      await redisClient.set(this.getKey(key), serialized)
    }
  }

  async delete(key: string): Promise<void> {
    await redisClient.del(this.getKey(key))
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redisClient.keys(`${this.prefix}:${pattern}`)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }
  }
}

// 앱별 캐시 인스턴스
export const webCache = new CacheManager('web')
export const gradingCache = new CacheManager('grading')

// 공통 캐시 유틸리티
export async function withCache<T>(
  cache: CacheManager,
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5분 기본값
): Promise<T> {
  // 캐시 확인
  const cached = await cache.get<T>(key)
  if (cached) return cached

  // 데이터 페치
  const data = await fetcher()
  
  // 캐시 저장
  await cache.set(key, data, ttl)
  
  return data
}