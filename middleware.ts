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
        async getAll() {
          return request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        async setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    }
  )

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

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

    // Only redirect to signin if accessing /builder without a session
    if (request.nextUrl.pathname.startsWith('/builder')) {
      if (!session) {
        return NextResponse.redirect(new URL('/signin', request.url))
      }
      return newResponse
    }

    // For all other routes, just return the response
    return newResponse
  } catch (e) {
    console.error('Error in middleware:', e)
    // Only redirect to signin if there's an error on protected routes
    if (request.nextUrl.pathname.startsWith('/builder')) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 