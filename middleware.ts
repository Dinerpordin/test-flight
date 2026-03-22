import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Sliding-window rate limiter: 10 search requests per 60 s per IP.
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60s'),
  analytics: true,
  prefix: 'test-flight:rl',
});

export default async function middleware(req: NextRequest) {
  // Only rate-limit the search API
  if (req.nextUrl.pathname.startsWith('/api/search')) {
    // Use the real client IP (Vercel injects x-forwarded-for)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';

    const { success, limit, remaining, reset } = await limiter.limit(ip);

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please wait before searching again.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on the search API route
  matcher: ['/api/search'],
};
