import { NextRequest, NextResponse } from 'next/server';
import { getSolutionCode } from '@/lib/problems';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const level = parseInt(request.nextUrl.searchParams.get('level') || '1');

  if (isNaN(level) || level < 1 || level > 4) {
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
  }

  const code = getSolutionCode(id, level);
  if (code === null) {
    return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
  }

  return NextResponse.json({ code });
}
