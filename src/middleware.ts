import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 로그인 페이지, 콜백, 정적 파일은 통과
    const { pathname } = request.nextUrl
    if (pathname === '/login' || pathname.startsWith('/auth/')) {
        return NextResponse.next()
    }

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
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        try {
            await supabase.auth.getUser()
        } catch {
            // Supabase 연결 실패해도 앱은 정상 동작
            console.warn('[middleware] Supabase auth check failed, continuing...')
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
