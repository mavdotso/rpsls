import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const { contractAddress, from, opponentAddress, bet, moveIndex } = await req.json();

        const newChallenge = await prisma.challenge.create({
            data: {
                contractAddress: contractAddress,
                j1: from,
                j2: opponentAddress,
                c1: moveIndex,
                stake: bet,
            },
        });

        return new NextResponse(JSON.stringify('Success'), { status: 200 });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error }), { status: 500 });
    }
}
