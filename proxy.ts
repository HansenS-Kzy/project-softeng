import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/register')

  
  // Kasus A: Jika user BELUM LOGIN tapi nekat mau masuk ke dalam aplikasi
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login' // Tendang balik ke halaman login
    return NextResponse.redirect(url)
  }

  // Kasus B: Jika user SUDAH LOGIN tapi malah mau buka halaman login/register lagi
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/' // Arahkan langsung ke halaman utama (beranda)
    return NextResponse.redirect(url)
  }

  // Jika aman, persilakan lewat
  return supabaseResponse
}

// 6. Menentukan rute mana saja yang akan dijaga oleh Middleware ini
export const config = {
  matcher: [
    /*
     * Middleware akan menjaga semua rute KECUALI:
     * - _next/static (file statis bawaan Next.js)
     * - _next/image (file gambar bawaan Next.js)
     * - favicon.ico (ikon web)
     * - gambar/file dengan ekstensi (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}