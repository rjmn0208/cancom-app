import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "./utils/supabase/middleware";
import { readUserSession } from "./utils/read-user-session";
import { jwtDecode } from "jwt-decode";
import { UserType } from "./lib/types";
import { signOutAction } from "./app/auth/auth-actions";

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createClient(request);
  // await signOutAction()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const currentPath = request.nextUrl.pathname;
  const PROTECTED_PATHS_PREFIX = {
    PATIENT: "/patient",
    CARETAKER: "/caretaker",
    DOCTOR: "/doctor",
    ADMIN: "/admin",
    MEDICAL_STAFF: "/medical-staff",
  };

  const inProtectedPath = Object.values(PROTECTED_PATHS_PREFIX).some((path) =>
    currentPath.startsWith(path),
  );
  const isAllowedPath = (userType: UserType, pathname: string): boolean => {
    return pathname.startsWith(PROTECTED_PATHS_PREFIX[userType]);
  };

  if (!user && inProtectedPath) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (user) {
    const userType = await getUserTypeFromAccessToken();
    console.log(userType);

    if (userType === null) {
      if (currentPath !== "/onboarding") {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      return response;
    }

    if (isAllowedPath(userType, currentPath)) {
      return response;
    }

    const redirectPath = PROTECTED_PATHS_PREFIX[userType];

    if (!currentPath.startsWith(redirectPath)) {
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return response;
}

async function getUserTypeFromAccessToken() {
  const {
    data: { session },
  } = await readUserSession();

  if (session) {
    const accessToken = session.access_token;
    const decodedToken: any = jwtDecode(accessToken);

    return decodedToken.user_type as UserType;
  }
  return null;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
