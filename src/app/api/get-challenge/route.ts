import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const { contractAddress } = await req.json();

        const challenge = await prisma.challenge.findFirst({
            where: { contractAddress: { contains: contractAddress, mode: 'insensitive' } },
        });

        return new NextResponse(JSON.stringify(challenge), { status: 200 });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error }), { status: 500 });
    }
}
