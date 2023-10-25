import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { fetchBalance } from '@wagmi/core';
import { MOVES } from './consts';
import { TIMEOUT_DURATION } from './consts';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function fetchTokenBalance(address: string) {
    let tokenBalance = await fetchBalance({
        address: address as `0x${string}`,
        formatUnits: 'ether',
    });

    const balance = Number(tokenBalance.formatted);
    return balance;
}

export function shortenAddress(address: string) {
    const firstPart = address.slice(0, 5);
    const lastPart = address.slice(-3);
    return `${firstPart}...${lastPart}`;
}

export function getPlayerMoveIndex(playerMove: string) {
    const playerMoveIndex = playerMove && MOVES.indexOf(playerMove) + 1; // add one because in the contract 0 is null
    return playerMoveIndex;
}

export function checkTimeout(gameStatus: string, updatedAt: Date) {
    const now = new Date();
    const lastActionDate = new Date(updatedAt);
    const timeElapsed = now.getTime() - lastActionDate.getTime();

    if (timeElapsed > TIMEOUT_DURATION) {
        if (gameStatus === 'CREATED') {
            return 'PLAYER2_TIMEOUT';
        } else if (gameStatus === 'PLAYER2_JOINED') {
            return 'PLAYER1_TIMEOUT';
        }
    }

    return null;
}
