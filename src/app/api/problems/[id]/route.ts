import { NextRequest, NextResponse } from 'next/server';
import { getProblemById, stripHiddenTests } from '@/lib/problems';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const problem = getProblemById(id);

  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  return NextResponse.json(stripHiddenTests(problem));
}
