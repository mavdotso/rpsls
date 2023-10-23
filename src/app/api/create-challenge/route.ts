import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const { contractAddress, from, opponentAddress, commitment, bet, playerMove } = await req.json();

        await prisma.challenge.create({
            data: {
                contractAddress: contractAddress,
                j1: from,
                j2: opponentAddress,
                c1Hash: commitment,
                c1: playerMove,
                stake: bet,
                lastAction: new Date(),
            },
        });
        return new NextResponse(JSON.stringify('Success'), { status: 200 });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error }), { status: 500 });
    }
}
