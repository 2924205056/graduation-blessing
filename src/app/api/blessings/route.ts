import { NextResponse } from 'next/server';
import { getBlessings, saveBlessing, clearScreen, getAllBlessings } from '@/lib/blessings';
import { Blessing } from '@/types/blessing';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');

  if (mode === 'history') {
    const blessings = await getAllBlessings();
    return NextResponse.json(blessings);
  }

  if (mode === 'active') {
    const blessings = await getBlessings();
    return NextResponse.json(blessings);
  }

  const blessings = await getBlessings();
  return NextResponse.json(blessings);
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'clear') {
    await clearScreen();
    return NextResponse.json({ success: true });
  }

  if (action === 'delete') {
    const body = await request.json();
    const { deleteAll } = body;
    if (deleteAll) {
      await clearScreen();
    }
    return NextResponse.json({ success: true });
  }

  const body = await request.json();
  const blessing: Blessing = {
    id: Date.now().toString(),
    name: body.name || '匿名',
    message: body.message,
    imageUrl: body.imageUrl,
    gownColor: body.gownColor,
    sticker: body.sticker,
    createdAt: Date.now(),
  };

  if (!blessing.message) {
    return NextResponse.json(
      { error: 'Message is required' },
      { status: 400 }
    );
  }

  await saveBlessing(blessing);
  return NextResponse.json(blessing, { status: 201 });
}
