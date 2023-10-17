import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { fetchBalance } from '@wagmi/core';

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
