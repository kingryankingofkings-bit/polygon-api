import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const email = 'kingryankingofkings@gmail.com';
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    });
    return NextResponse.json({ success: true, message: 'User is now admin', user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
