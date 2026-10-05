import { NextResponse } from 'next/server';
import { getServerState, updateServerState } from '@/lib/server-state';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const state = await getServerState();
    return NextResponse.json({
      firebaseConfig: state.firebaseConfig,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve config' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firebaseConfig } = body || {};

    await updateServerState({ firebaseConfig });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
