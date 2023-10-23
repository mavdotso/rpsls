'use client';
import { Button } from './ui/button';
import { useWalletClient, useAccount } from 'wagmi';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MOVES } from '@/lib/consts';
import { useEffect, useState } from 'react';
import { publicClient } from '@/lib/viemConfitg';
import { submitMove, solve, j1Timeout, j2Timeout, getWinner } from '@/lib/functions';
import { getPlayerMoveIndex } from '@/lib/utils';
import { checkTimeout } from '@/lib/utils';

interface PlayerActionsProps {
    j2: string;
    gameStatus: string;
    contractAddress: string;
    stake: number;
    updatedAt: Date;
}

export default function PlayerActions({ j2, gameStatus, contractAddress, stake, updatedAt }: PlayerActionsProps) {
    const { data: walletClient } = useWalletClient();
    const { address: userAddress } = useAccount();
    const [playerMove, setPlayerMove] = useState<string>('');
    const [isPlayerOne, setIsPlayerOne] = useState<boolean>(false);
    const [isJ1Winner, setIsJ1Winner] = useState<boolean>();

    useEffect(() => {
        if (userAddress === j2) {
            setIsPlayerOne(false);
        } else {
            setIsPlayerOne(true);
        }
    }, [userAddress, j2]);

    async function handleSubmitMove() {
        const hash = await submitMove(playerMove, stake, contractAddress, walletClient, userAddress as `0x${string}`);

        const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

        const c2 = getPlayerMoveIndex(playerMove);

        if (transaction.status === 'success') {
            await fetch('/api/update-move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractAddress, status: 'PLAYER2_JOINED', c2 }),
            });
            console.log('PLAYER2_JOINED');
        }
    }

    async function handleSolve() {
        const res = await fetch(`/api/get-challenge`, {
            method: 'POST',
            body: JSON.stringify({ contractAddress }),
        });
        const data = await res.json();
        const c1 = data.c1;

        const hash = await solve(c1, contractAddress, walletClient, userAddress as `0x${string}`);

        const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

        if (transaction.status === 'success') {
            await fetch('/api/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractAddress, status: 'COMPLETED' }),
            });

            const winner = await getWinner(contractAddress as `0x${string}`, c1, playerMove);
            setIsJ1Winner(!!winner);
        }
    }

    async function handleJ1Timeout() {
        const hash = await j1Timeout(walletClient, contractAddress, userAddress as `0x${string}`);
        const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });
        if (transaction.status === 'success') {
            await fetch('/api/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractAddress, status: 'COMPLETED' }),
            });
        }
    }

    async function handleJ2Timeout() {
        const hash = await j2Timeout(walletClient, contractAddress, userAddress as `0x${string}`);
        const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });
        if (transaction.status === 'success') {
            await fetch('/api/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractAddress, status: 'COMPLETED' }),
            });
        }
    }

    useEffect(() => {
        const timeoutResult = checkTimeout(gameStatus, updatedAt);

        console.log(timeoutResult);

        if (timeoutResult) {
            fetch('/api/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractAddress, status: timeoutResult }),
            });
        }
    }, [updatedAt, gameStatus, contractAddress]);

    // If player 1
    if (isPlayerOne) {
        if (gameStatus === 'PLAYER2_TIMEOUT') {
            return (
                <div>
                    <p>Player 2 timed out</p>
                    <Button onClick={handleJ2Timeout}>Payout</Button>
                </div>
            );
        } else if (gameStatus === 'CREATED') {
            return (
                <Button variant="secondary" disabled>
                    Waiting for the opponent
                </Button>
            );
        } else if (gameStatus === 'PLAYER2_JOINED') {
            return <Button onClick={handleSolve}>Reveal your move</Button>;
        } else if (gameStatus === 'COMPLETED') {
            if (isJ1Winner) {
                return (
                    <Button variant="secondary" disabled>
                        You win
                    </Button>
                );
            } else {
                return (
                    <Button variant="secondary" disabled>
                        You lost
                    </Button>
                );
            }
        }
    } else {
        // if player 2
        if (gameStatus === 'PLAYER1_TIMEOUT') {
            return (
                <div>
                    <p>Player 1 timed out</p>
                    <Button onClick={handleJ1Timeout}>Payout</Button>
                </div>
            );
        } else if (gameStatus === 'CREATED') {
            return (
                <div>
                    <div className="grid w-full max-w-sm items-center gap-2.5 pb-2">
                        <Label htmlFor="move">Your move</Label>
                        <RadioGroup required id="move" onValueChange={(value) => setPlayerMove(value)}>
                            <div className="flex items-center gap-2">
                                {MOVES.map((move, index) => (
                                    <span key={index} className="flex items-center space-x-2">
                                        <RadioGroupItem value={move} id={`option-${index}`} />
                                        <Label htmlFor={`option-${index}`}>{move}</Label>
                                    </span>
                                ))}
                            </div>
                        </RadioGroup>
                    </div>
                    <Button onClick={handleSubmitMove}>Submit a move</Button>
                </div>
            );
        } else if (gameStatus === 'PLAYER2_JOINED') {
            return (
                <Button variant="secondary" disabled>
                    Waiting for the opponent
                </Button>
            );
        } else if (gameStatus === 'COMPLETED') {
            if (isJ1Winner) {
                return (
                    <Button variant="secondary" disabled>
                        You lost
                    </Button>
                );
            } else {
                return (
                    <Button variant="secondary" disabled>
                        You win
                    </Button>
                );
            }
        }
    }
}
