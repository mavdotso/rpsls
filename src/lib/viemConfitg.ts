import { createPublicClient, http, fallback } from 'viem';
import { sepolia } from 'viem/chains';

const alchemy = http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);

export const publicClient = createPublicClient({
    chain: sepolia,
    transport: fallback([alchemy]),
});
