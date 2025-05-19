// frontend/app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { API_URL } from '@/config';

export async function GET(request) {
  // Get cookies from the request to forward them
  const cookies = request.headers.get('Cookie') || '';
  const { searchParams } = new URL(request.url);
  
  const queryString = Array.from(searchParams.entries())
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  try {
    const apiUrl = `${API_URL}/api/admin/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        ...(cookies && { Cookie: cookies })
      },
      credentials: 'include'
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}