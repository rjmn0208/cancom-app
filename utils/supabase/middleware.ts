import { signOutAction } from '@/app/auth/auth-actions'
import { User, UserType } from '@/lib/types'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS_PREFIX = {
  PATIENT: '/patient',
  CARETAKER: '/caretaker',
  DOCTOR: '/doctor'
}

const isAllowedPath = (userType: UserType, pathname: string): boolean => {
  return pathname.startsWith(PROTECTED_PATHS_PREFIX[userType]);
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out. 
    const { data: { user }, error } = await supabase.auth.getUser();
    // await signOutAction()
    console.log(user)
    const currentPath = request.nextUrl.pathname
    const skipPaths = ['/onboarding', '/message', '/sign-in'];
    if (skipPaths.some(path => currentPath.startsWith(path))) {
      return response
    }

    const isProtectedPath = Object.values(PROTECTED_PATHS_PREFIX).some((path) =>
      currentPath.startsWith(path)
    );;
    
    if (!user && isProtectedPath) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (user) { 
      const {data: userData, error: userDataError}: any = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single()
      // console.log(userData)

      if(!userData || userDataError){
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      if (isAllowedPath(userData.userType as UserType, currentPath)) {
        return response;
      }
      
      const redirectPath = PROTECTED_PATHS_PREFIX[userData.userType as UserType];

      if (!currentPath.startsWith(redirectPath)) {
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  
    
  return response;
}


  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:  
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!