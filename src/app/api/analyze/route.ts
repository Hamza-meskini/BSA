import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get('brand');
  const days = searchParams.get('days');

  if (!brand || !days) {
    return NextResponse.json(
      { error: 'Brand and days parameters are required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`http://localhost:8000/api/${brand}/${days}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
} 