import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// export const updateChallenge = async (id: string, updatedData: any) => {
//     return await prisma.challenge.update({
//         where: { id },
//         data: updatedData,
//     });
// };

// export const getActiveChallenges = async () => {
//     return await prisma.challenge.findMany({
//         where: { c2: null },
//     });
// };
