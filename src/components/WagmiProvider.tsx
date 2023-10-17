'use client';

import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmiConfig';
import { ReactNode } from 'react';

export default function WagmiProvider({ children }: { children: ReactNode }) {
    return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}
