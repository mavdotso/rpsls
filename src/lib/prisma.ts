'use client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createChallenge = async (j1: string, j2: string, c1Hash: string, stake: number) => {
    return await prisma.challenge.create({
        data: {
            j1,
            j2,
            c1Hash,
            stake,
            lastAction: new Date(),
        },
    });
};

export const updateChallenge = async (id: string, updatedData: any) => {
    return await prisma.challenge.update({
        where: { id },
        data: updatedData,
    });
};

export const getActiveChallenges = async () => {
    return await prisma.challenge.findMany({
        where: { c2: null },
    });
};
