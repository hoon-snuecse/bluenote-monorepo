# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy package files
COPY packages ./packages
COPY apps/grading ./apps/grading

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm build --filter=grading

# Production stage
FROM node:18-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/apps/grading/package.json ./package.json
COPY --from=builder /app/apps/grading/.next ./.next
COPY --from=builder /app/apps/grading/public ./public
COPY --from=builder /app/apps/grading/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Copy workspace dependencies
COPY --from=builder /app/packages ./packages

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Start the application
CMD ["node_modules/.bin/next", "start", "-p", "3002"]