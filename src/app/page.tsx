'use client';
import ChallengeForm from '@/components/ChallengeForm';
import { useWalletClient, useAccount } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';
import { MOVES } from '@/lib/consts';
import { useToast } from '@/components/ui/use-toast';
import { publicClient } from '@/lib/viemConfitg';
import { deployContract } from '@/lib/functions';
import { ChallengeList } from '@/components/ChallengeList';

export interface Challenge {
    contractAddress: string;
    j2: string;
    stake: number;
    status: string;
    updatedAt: Date;
}

export default function Home() {
    const { toast } = useToast();
    const { data: walletClient } = useWalletClient();
    const { address: userAddress, isConnected } = useAccount();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [bet, setBet] = useState<number>(0.005);
    const [playerMove, setPlayerMove] = useState<string>('');
    const [opponentAddress, setOpponentAddress] = useState<string>('');
    const [isDeploying, setIsDeploying] = useState<boolean>(false);

    async function handleDeployContract() {
        if (!isConnected) {
            handleError('Please, connect your wallet');
            return;
        }
        if (!playerMove) {
            handleError('Please, select a move');
            return;
        }

        const hash = await deployContract(playerMove, bet, walletClient, userAddress as `0x${string}`, opponentAddress as `0x${string}`);

        setIsDeploying(true);

        const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

        if (transaction.status === 'success') {
            const contractAddress = transaction.contractAddress;
            const from = transaction.from;
            const moveIndex = MOVES.indexOf(playerMove) + 1;
            await fetch('/api/create-challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractAddress, from, opponentAddress, bet, moveIndex }),
            });
            setIsDeploying(false);
            handleSuccess('Your opponent has been challenged!');
            setBet(0);
            setOpponentAddress('');
            setPlayerMove('');
        } else {
            handleError();
            setIsDeploying(false);
        }
    }

    function handleError(errorMessage: string = '') {
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: `There was a problem with your request. ${errorMessage}`,
        });
    }

    function handleSuccess(successMessage: string = '') {
        toast({
            title: 'Success!',
            description: successMessage,
        });
    }

    async function fetchChallenges(userAddress: string) {
        const res = await fetch(`/api/get-challenges`, {
            method: 'POST',
            body: JSON.stringify({ userAddress }),
        });
        const data = await res.json();

        setChallenges([...data]);
    }

    const handleRefresh = useCallback(() => {
        if (isConnected && userAddress) {
            fetchChallenges(userAddress);
        }
    }, [isConnected, userAddress]);

    const updateStatus = useCallback(
        async (contractAddress: string, status: string) => {
            await fetch('/api/update-challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractAddress, status }),
            });
            handleRefresh();
        },
        [handleRefresh]
    );

    useEffect(() => {
        if (isConnected && userAddress) {
            fetchChallenges(userAddress);
        }
    }, [userAddress, isConnected, isDeploying, updateStatus]);

    return (
        <main className="container flex gap-2 flex-wrap">
            <ChallengeForm
                bet={bet}
                setBet={setBet}
                opponentAddress={opponentAddress}
                setOpponentAddress={setOpponentAddress}
                setPlayerMove={setPlayerMove}
                isDeploying={isDeploying}
                handleDeployContract={handleDeployContract}
            />
            <ChallengeList challenges={challenges} updateStatus={updateStatus} handleRefresh={handleRefresh} />
        </main>
    );
}
