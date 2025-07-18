import * as Sentry from '@sentry/nextjs'

interface SentryConfig {
  dsn: string
  environment: string
  appName: string
}

export function initSentry(config: SentryConfig) {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    beforeSend(event) {
      // 앱별 태그 추가
      event.tags = {
        ...event.tags,
        app: config.appName,
      }
      return event
    },
  })
}

// 에러 캡처 헬퍼
export function captureError(
  error: Error,
  context: {
    user?: string
    action: string
    metadata?: Record<string, any>
  }
) {
  Sentry.captureException(error, {
    tags: {
      action: context.action,
    },
    user: context.user ? { email: context.user } : undefined,
    extra: context.metadata,
  })
}

// 성능 모니터링
export function measurePerformance(
  transactionName: string,
  operation: () => Promise<any>
) {
  const transaction = Sentry.startTransaction({
    name: transactionName,
    op: 'function',
  })

  Sentry.getCurrentHub().configureScope(scope => scope.setSpan(transaction))

  return operation()
    .then(result => {
      transaction.setStatus('ok')
      return result
    })
    .catch(error => {
      transaction.setStatus('internal_error')
      throw error
    })
    .finally(() => {
      transaction.finish()
    })
}