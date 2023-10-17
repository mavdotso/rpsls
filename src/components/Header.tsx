'use client';
import Image from 'next/image';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchTokenBalance } from '@/lib/utils';
import { UserNav } from './ui/user-nav';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from './ui/toaster';

export default function Header() {
    const [tokenBalance, setTokenBalance] = useState(0);
    const { toast } = useToast();
    const { address, isConnected } = useAccount();

    const { connect } = useConnect({
        connector: new InjectedConnector(),
    });

    const { disconnect } = useDisconnect();

    useEffect(() => {
        if (isConnected) {
            (async () => {
                let calculateBalance = await fetchTokenBalance(address as `0x${string}`);
                setTokenBalance(calculateBalance);
            })();

            toast({
                title: 'Connected',
                description: 'You are now connected.',
            });
        }
    }, [address, isConnected, toast]);

    return (
        <header className="lg:container flex justify-between items-center p-6">
            <Image src="/logo.svg" width="120" height="50" alt="logo" />
            <Toaster />
            {isConnected ? (
                <UserNav address={address as `0x${string}`} tokenBalance={tokenBalance} disconnect={disconnect} />
            ) : (
                <Button className="gap-2" onClick={() => connect()}>
                    <Wallet className="w-4 h-4" /> Connect wallet
                </Button>
            )}
        </header>
    );
}
