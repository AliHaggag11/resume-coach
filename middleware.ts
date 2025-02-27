import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error)
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    // Update response headers with new cookie values
    const newResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Copy over all cookies from response to newResponse
    response.cookies.getAll().forEach((cookie) => {
      newResponse.cookies.set(cookie.name, cookie.value, cookie)
    })

    if (request.nextUrl.pathname.startsWith('/builder') && !session) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    return newResponse
  } catch (e) {
    console.error('Error in middleware:', e)
    return NextResponse.redirect(new URL('/signin', request.url))
  }
}

export const config = {
  matcher: [
    '/builder/:path*'
  ]
} 