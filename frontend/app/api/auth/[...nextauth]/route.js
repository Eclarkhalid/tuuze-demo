import { NextResponse } from 'next/server';

// This route handler will forward requests to the backend API
async function handler(req, { params }) {
  const authPath = params.nextauth.join('/');
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${authPath}`;
  
  try {
    // Forward the request to the backend with the same method and body
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.get('Authorization') && {
          'Authorization': req.headers.get('Authorization')
        }),
        ...(req.headers.get('Cookie') && {
          'Cookie': req.headers.get('Cookie')
        })
      },
      body: req.method !== 'GET' ? JSON.stringify(await req.json()) : undefined,
      credentials: 'include'
    });
    
    const data = await response.json();
    
    // If the response includes a token, set it as a cookie
    const responseHeaders = new Headers();
    
    if (data.token) {
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