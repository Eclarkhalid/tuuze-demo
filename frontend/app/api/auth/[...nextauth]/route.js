import { NextResponse } from 'next/server';

// This route handler will forward requests to the backend API
async function handler(req, { params }) {
  const authPath = params.nextauth.join('/');
  
  // Determine the backend API URL, using either environment variable or default
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/${authPath}`;
  
  // Extract cookies from the request to forward them
  const cookies = req.headers.get('Cookie') || '';
  
  try {
    // Forward the request to the backend with the same method and body
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.get('Authorization') && {
          'Authorization': req.headers.get('Authorization')
        }),
        ...(cookies && {
          'Cookie': cookies
        })
      },
      body: req.method !== 'GET' ? JSON.stringify(await req.json()) : undefined,
      credentials: 'include'
    });
    
    const data = await response.json();
    
    // If the response includes a token, set it as a cookie
    const responseHeaders = new Headers();
    
    // Get cookies from the backend response
    const setCookieHeader = response.headers.get('Set-Cookie');
    
    if (setCookieHeader) {
      // Forward Set-Cookie header from backend
      responseHeaders.append('Set-Cookie', setCookieHeader);
    } else if (data.token) {
      // Fallback: set cookie manually if no Set-Cookie header but token exists
      const cookieOptions = [
        `jwt=${data.token}`,
        `Path=/`,
        `HttpOnly`,
        `Max-Age=${60 * 60 * 24}`, // 1 day
        process.env.NODE_ENV === 'production' ? 'Secure' : ''
      ].filter(Boolean).join('; ');
      
      responseHeaders.append('Set-Cookie', cookieOptions);
    }
    
    // If it's a logout request, clear the cookie
    if (authPath === 'logout') {
      responseHeaders.append('Set-Cookie', 'jwt=; Path=/; HttpOnly; Max-Age=0');
    }
    
    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;