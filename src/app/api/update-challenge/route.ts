// File: update-challenge.js
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const { contractAddress, ...data } = await req.json();

        const updatedChallenge = await prisma.challenge.update({
            where: { contractAddress },
            data,
        });

        return new NextResponse(JSON.stringify(updatedChallenge), { status: 200 });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error }), { status: 500 });
    }
}
