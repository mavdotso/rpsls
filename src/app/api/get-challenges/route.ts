import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const { userAddress } = await req.json();

        const challenges = await prisma.challenge.findMany({
            where: {
                OR: [{ j1: { contains: userAddress, mode: 'insensitive' } }, { j2: { contains: userAddress, mode: 'insensitive' } }],
            },
        });

        return new NextResponse(JSON.stringify(challenges), { status: 200 });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error }), { status: 500 });
    }
}
