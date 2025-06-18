import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.API_KEY;

  // Debug logging
  console.log('Environment variables:');
  console.log('NEXT_PUBLIC_API_URL:', apiUrl);
  console.log('API_KEY length:', apiKey ? apiKey.length : 0);

  if (!apiUrl) {
    console.error('NEXT_PUBLIC_API_URL is not defined');
    return NextResponse.json(
      { error: 'API URL is not configured' },
      { status: 500 }
    );
  }

  if (!apiKey) {
    console.error('API_KEY is not defined');
    return NextResponse.json(
      { error: 'API Key is not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { brand, daysAgo } = body;

    if (!brand || !daysAgo) {
      return NextResponse.json(
        { error: 'Brand and daysAgo are required' },
        { status: 400 }
      );
    }

    console.log(`Making request to ${apiUrl}/api/${brand}/${daysAgo}`);

    const response = await fetch(`${apiUrl}/api/${brand}/${daysAgo}`, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey
      }
    });

    if (!response.ok) {
      let errorDetail = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || errorData.detail || errorDetail;
      } catch (e) {
        errorDetail = response.statusText || errorDetail;
      }
      console.error("API Error:", errorDetail);
      return NextResponse.json(
        { error: errorDetail },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in analyze route:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 