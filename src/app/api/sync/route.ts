import { NextResponse } from 'next/server';
import { getServerState, updateServerState, registerServerPresence } from '@/lib/server-state';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const state = await getServerState();
    const connectedCount = Object.keys(state.presence).length;

    return NextResponse.json(
      {
        ...state,
        connectedDisplaysCount: connectedCount,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err) {
    console.error('API /api/sync GET error:', err);
    return NextResponse.json({ error: 'Failed to retrieve sync state' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, payload, eventState, scenes, announcements, schedule, presence } = body || {};

    if (type === 'PRESENCE_PING' && payload) {
      registerServerPresence(payload);
      return NextResponse.json({ success: true, timestamp: Date.now() });
    }

    if (presence) {
      registerServerPresence(presence);
    }

    const updated = await updateServerState({
      eventState: eventState || (type === 'EVENT_STATE_UPDATE' ? payload : undefined),
      scenes: scenes || (type === 'SCENES_UPDATE' ? payload : undefined),
      announcements: announcements || (type === 'ANNOUNCEMENTS_UPDATE' ? payload : undefined),
      schedule: schedule || (type === 'SCHEDULE_UPDATE' ? payload : undefined),
    });

    return NextResponse.json(
      {
        success: true,
        version: updated.version,
        updatedAt: updated.updatedAt,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err) {
    console.error('API /api/sync POST error:', err);
    return NextResponse.json({ error: 'Failed to update sync state' }, { status: 500 });
  }
}
