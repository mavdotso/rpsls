import { createConfig } from 'wagmi';
import { configureChains } from '@wagmi/core';
import { publicProvider } from '@wagmi/core/providers/public';
import { sepolia } from '@wagmi/core/chains';

const { chains, publicClient, webSocketPublicClient } = configureChains([sepolia], [publicProvider()]);

export const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
});
