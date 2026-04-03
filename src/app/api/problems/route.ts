import { NextResponse } from 'next/server';
import { loadAllProblems, stripTestCases } from '@/lib/problems';

export async function GET() {
  try {
    const problems = loadAllProblems().map(stripTestCases);
    return NextResponse.json(problems);
  } catch (err) {
    console.error('Failed to load problems:', err);
    return NextResponse.json(
      { error: 'Failed to load problems' },
      { status: 500 }
    );
  }
}
