import Queue from 'bull'
import Redis from 'redis'

// 공통 큐 설정
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
}

// 평가 큐 (grading 앱에서 사용)
export const evaluationQueue = new Queue('evaluation', { redis: redisConfig })

// 알림 큐 (web 앱에서 사용)
export const notificationQueue = new Queue('notification', { redis: redisConfig })

// 이메일 큐 (양쪽 앱에서 사용)
export const emailQueue = new Queue('email', { redis: redisConfig })

// 공통 큐 헬퍼 함수
export async function addJobToQueue(
  queue: Queue.Queue,
  jobName: string,
  data: any,
  options?: Queue.JobOptions
) {
  return await queue.add(jobName, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    ...options,
  })
}

// 큐 상태 모니터링
export async function getQueueStatus(queue: Queue.Queue) {
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ])

  return { waiting, active, completed, failed }
}