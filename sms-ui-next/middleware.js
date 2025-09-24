// middleware.js (place this in your project root)
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/station/stationdashboard',
  '/warehouse/warehousedashboard',
  '/admin/admindashboard',
  '/login',
  '/reset-password',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  // Add more public routes as needed
];

// Helper: get user session from cookie
function getUserSession(request) {
  try {
    // Only use cookies in middleware - sessionStorage is not available server-side
    const userDataCookie = request.cookies.get('userData');
    
    if (!userDataCookie || !userDataCookie.value) {
      console.log('No userData cookie found');
      return null;
    }

    // console.log('Raw cookie value:', userDataCookie.value);
    
    const userData = JSON.parse(userDataCookie.value);
    
    // Ensure numeric values are properly converted
    if (userData) {
      userData.roleid = userData.roleid !== undefined ? parseInt(userData.roleid, 10) : userData.roleid;
      userData.roletypeid = userData.roletypeid !== undefined ? parseInt(userData.roletypeid, 10) : userData.roletypeid;
      
      // console.log('Parsed userData:', {
      //   roleid: userData.roleid,
      //   roletypeid: userData.roletypeid,
      //   hasUrls: !!userData.urls,
      //   urlsLength: userData.urls?.length || 0
      // });
    }
    
    return userData;
  } catch (e) {
    console.error('Error parsing user session:', e.message);
    console.error('Cookie value that failed to parse:', request.cookies.get('userData')?.value);
    return null;
  }
}

// Helper: get dashboard by roleid
function getDashboard(roleid, origin) {
  const numericRoleid = parseInt(roleid, 10);
  switch (numericRoleid) {
    case 0:
      return `${origin}/admin/admindashboard`;
    case 4:
      return `${origin}/warehouse/warehousedashboard`;
    case 5:
      return `${origin}/station/stationdashboard`;
    default:
      return `${origin}/`;
  }
}

// Helper: check if a route is public
function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some(route => {
    if (route === pathname) return true;
    if (route.endsWith('*')) {
      const routeBase = route.slice(0, -1);
      return pathname.startsWith(routeBase);
    }
    return false;
  });
}

// Helper: normalize and decode path to handle encoding issues
function normalizePath(pathname) {
  try {
    // Decode URI component to handle encoded characters
    let decodedPath = decodeURIComponent(pathname);
    
    // Remove any double slashes
    decodedPath = decodedPath.replace(/\/+/g, '/');
    
    // Ensure path starts with /
    if (!decodedPath.startsWith('/')) {
      decodedPath = '/' + decodedPath;
    }
    
    // Remove trailing slash except for root
    if (decodedPath.length > 1 && decodedPath.endsWith('/')) {
      decodedPath = decodedPath.slice(0, -1);
    }
    
    return decodedPath;
  } catch (error) {
    console.error('Error normalizing path:', error);
    return pathname;
  }
}

export function middleware(request) {
  const { pathname, search, origin } = request.nextUrl;
  
  // Normalize the path to handle encoding issues
  const normalizedPath = normalizePath(pathname);
  
  // console.log('Middleware Debug:', {
  //   originalPath: pathname,
  //   normalizedPath,
  //   search,
  //   origin
  // });

  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check if the current path is a public route
  if (isPublicRoute(normalizedPath)) {
    console.log('Public route accessed:', normalizedPath);
    return NextResponse.next();
  }

  // Get user session
  const userData = getUserSession(request);
  // console.log('User Data:', userData ? { 
  //   roleid: userData.roleid,
  //   roletypeid: userData.roletypeid,
  //   roletypeidType: typeof userData.roletypeid,
  //   urls: userData.urls?.length || 0
  // } : 'No user data');

  // If not logged in and not a public route, redirect to login
  if (!userData) {
    const loginUrl = new URL('/', origin);
    if (normalizedPath !== '/') {
      loginUrl.searchParams.set('redirect', normalizedPath + (search || ''));
    }
    
    console.log('Redirecting to login:', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  // Allow all access for roletypeid 1, 2, and 5 (now with proper type handling)
  const numericRoleTypeId = parseInt(userData.roletypeid, 10);
  if ([1, 2, 5].includes(numericRoleTypeId)) {
    console.log('Full access granted for roletypeid:', numericRoleTypeId);
    return NextResponse.next();
  }

  // For other roles, check if the route is in their allowed URLs
  const userUrls = userData.urls || [];
  const isAllowed = userUrls.some(url => {
    const normalizedUrl = normalizePath(url);
    const exactMatch = normalizedPath === normalizedUrl;
    const prefixMatch = normalizedPath.startsWith(normalizedUrl + '/');
    
    if (exactMatch || prefixMatch) {
      console.log('Route allowed:', { normalizedPath, normalizedUrl, exactMatch, prefixMatch });
      return true;
    }
    return false;
  });

  if (isAllowed) {
    return NextResponse.next();
  }

  // Not allowed: redirect to appropriate dashboard
  const dashboardUrl = new URL(getDashboard(userData.roleid, origin));
  dashboardUrl.searchParams.set('unauthorized', 'true');
  
  console.log('Unauthorized access, redirecting to dashboard:', dashboardUrl.toString());
  return NextResponse.redirect(dashboardUrl);
}

export const config = {
  matcher: [
    '/((?!api/public|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};