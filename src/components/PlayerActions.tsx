'use client';
import { useWalletClient, useAccount } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';
import { publicClient } from '@/lib/viemConfitg';
import { submitMove, solve, j1Timeout, j2Timeout, getWinner } from '@/lib/functions';
import { getPlayerMoveIndex } from '@/lib/utils';
import { checkTimeout } from '@/lib/utils';

import { PlayerOneActions } from './actions/PlayerOneActions';
import { PlayerTwoActions } from './actions/PlayerTwoActions';

interface PlayerActionsProps {
    j2: string;
    gameStatus: string;
    contractAddress: string;
    stake: number;
    updatedAt: Date;
    updateStatus: (contractAddress: string, status: string) => Promise<void>;
}

export default function PlayerActions({ j2, gameStatus, contractAddress, stake, updatedAt, updateStatus }: PlayerActionsProps) {
    const { data: walletClient } = useWalletClient();
    const { address: userAddress } = useAccount();
    const [playerMove, setPlayerMove] = useState<string>('');
    const [isPlayerOne, setIsPlayerOne] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [winner, setWinner] = useState<string | null>(null);

    // Checking player 1 or player 2
    useEffect(() => {
        if (userAddress === j2) {
            setIsPlayerOne(false);
        } else {
            setIsPlayerOne(true);
        }
    }, [userAddress, j2]);

    async function handleSubmitMove() {
        setIsLoading(true);
        const hash = await submitMove(playerMove, stake, contractAddress, walletClient, userAddress as `0x${string}`);

        const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

        const c2 = getPlayerMoveIndex(playerMove);

        if (transaction.status === 'success') {
            await fetch('/api/update-challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractAddress, status: 'PLAYER2_JOINED', c2 }),
            });
            updateStatus(contractAddress, 'PLAYER2_JOINED');
        }
        setIsLoading(false);
    }

    async function handleSolve() {
        setIsLoading(true);

        const res = await fetch(`/api/get-challenge`, {
            method: 'POST',
            body: JSON.stringify({ contractAddress }),
        });
        const data = await res.json();
        const c1 = data.c1;

        const hash = await solve(c1, contractAddress, walletClient, userAddress as `0x${string}`);

        const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

        if (transaction.status === 'success') {
            const winner = await getWinner(contractAddress as `0x${string}`, c1, playerMove);
            const winnerString = winner ? 'j1' : 'j2';
            await fetch('/api/update-challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractAddress, winner: winnerString }),
            });
            updateStatus(contractAddress, 'COMPLETED');
        }
        setIsLoading(false);
    }

    async function handleJ1Timeout() {
        setIsLoading(true);
        const hash = await j1Timeout(walletClient, contractAddress, userAddress as `0x${string}`);
        const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });
        console.log(transaction.status);
        if (transaction.status === 'success') {
            updateStatus(contractAddress, 'COMPLETED');
        }
        setIsLoading(false);
    }

    async function handleJ2Timeout() {
        setIsLoading(true);
        const hash = await j2Timeout(walletClient, contractAddress, userAddress as `0x${string}`);
        const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });
        console.log(transaction.status);
        if (transaction.status === 'success') {
            updateStatus(contractAddress, 'COMPLETED');
        }
        setIsLoading(false);
    }

    const fetchWinner = useCallback(async () => {
        try {
            const res = await fetch(`/api/get-challenge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractAddress }),
            });

            if (!res.ok) {
                throw new Error('Failed to fetch challenge');
            }

            const data = await res.json();
            if (data && data.winner) {
                setWinner(data.winner);
            } else {
                console.error('Winner not found');
            }
        } catch (error) {
            console.error('Failed to fetch winner:', error);
        }
    }, [contractAddress]);

    useEffect(() => {
        const timeoutResult = checkTimeout(gameStatus, updatedAt);
        if (timeoutResult) {
            updateStatus(contractAddress, timeoutResult);
        }
        if (gameStatus === 'COMPLETED') {
            fetchWinner();
        }
    }, [updatedAt, gameStatus, contractAddress, updateStatus, fetchWinner]);

    // Rendering different player actions for each player
    if (isPlayerOne) {
        return <PlayerOneActions isLoading={isLoading} gameStatus={gameStatus} winner={winner || ''} handleSolve={handleSolve} handleJ2Timeout={handleJ2Timeout} />;
    } else {
        return (
            <PlayerTwoActions isLoading={isLoading} gameStatus={gameStatus} winner={winner || ''} handleSubmitMove={handleSubmitMove} handleJ1Timeout={handleJ1Timeout} setPlayerMove={setPlayerMove} />
        );
    }

    return null;
}
