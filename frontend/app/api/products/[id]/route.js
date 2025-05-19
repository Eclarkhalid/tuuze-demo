// frontend/app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import { API_URL } from '@/config';

export async function GET(request, { params }) {
  const { id } = params;
  // Get cookies from the request to forward them
  const cookies = request.headers.get('Cookie') || '';

  try {
    const apiUrl = `${API_URL}/api/products/${id}`;
    
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

export async function PATCH(request, { params }) {
  const { id } = params;
  // Get cookies from the request to forward them
  const cookies = request.headers.get('Cookie') || '';
  
  try {
    const body = await request.json();
    
    const apiUrl = `${API_URL}/api/products/${id}`;
    
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { Cookie: cookies })
      },
      body: JSON.stringify(body),
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

export async function DELETE(request, { params }) {
  const { id } = params;
  // Get cookies from the request to forward them
  const cookies = request.headers.get('Cookie') || '';

  try {
    const apiUrl = `${API_URL}/api/products/${id}`;
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
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