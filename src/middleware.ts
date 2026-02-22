import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 인증 없이 접근 가능한 경로
const PUBLIC_PATHS = ['/', '/login', '/coach', '/report', '/manifest.webmanifest']
const PUBLIC_PREFIXES = ['/auth/', '/api/']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 공개 경로는 세션 갱신만 하고 통과
    const isPublic = PUBLIC_PATHS.includes(pathname) ||
        PUBLIC_PREFIXES.some(p => pathname.startsWith(p))

    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Supabase 설정이 없으면 그냥 통과
    if (!supabaseUrl || !supabaseKey) {
        return response
    }

    try {
        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        })

        // 세션 갱신 시도 (타임아웃 5초)
        const timeout = setTimeout(() => {}, 5000)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            // 비공개 페이지인데 비로그인 → 로그인으로 리다이렉트
            if (!isPublic && !user) {
                const loginUrl = new URL('/login', request.url)
                loginUrl.searchParams.set('next', pathname)
                return NextResponse.redirect(loginUrl)
            }
        } catch {
            // Supabase 연결 실패 시: 공개 페이지면 통과, 비공개면 리다이렉트
            if (!isPublic) {
                const loginUrl = new URL('/login', request.url)
                loginUrl.searchParams.set('next', pathname)
                return NextResponse.redirect(loginUrl)
            }
        } finally {
            clearTimeout(timeout)
        }
    } catch {
        // Supabase 클라이언트 생성 실패해도 통과
        console.warn('[middleware] Supabase client creation failed')
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
