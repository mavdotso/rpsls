'use client';
import { Button } from './ui/button';
import { useWalletClient, useAccount } from 'wagmi';
import { getWalletClient } from '@wagmi/core';
import { utils } from 'ethers';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MOVES } from '@/lib/consts';
import { useEffect, useState } from 'react';
import { contractAbi } from '../../contracts/contract';
import { sepolia } from '@wagmi/core/chains';
import { parseEther } from 'viem';
import { publicClient } from '@/lib/viemConfitg';

interface PlayerActionsProps {
    j2: string;
    gameStatus: string;
    contractAddress: string;
    stake: number;
}

export default function PlayerActions({ j2, gameStatus, contractAddress, stake }: PlayerActionsProps) {
    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();
    const [moveValue, setMoveValue] = useState<string>();
    const [isPlayerOne, setIsPlayerOne] = useState<boolean>(false);

    useEffect(() => {
        if (address === j2) {
            setIsPlayerOne(false);
        } else {
            setIsPlayerOne(true);
        }
    }, [address, j2]);

    async function submitMove() {
        if (walletClient) {
            try {
                const playerMove = moveValue && MOVES.indexOf(moveValue) + 1; // add one because in the contract 0 is null
                const bet = BigInt(parseEther(stake.toString()));

                const hash = await walletClient.writeContract({
                    address: contractAddress as `0x${string}`,
                    account: address,
                    abi: contractAbi,
                    functionName: 'play',
                    chain: sepolia,
                    args: [playerMove],
                    value: bet,
                    gas: BigInt(utils.parseUnits('1000000', 'wei').toString()),
                });

                const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

                if (transaction.status === 'success') {
                    await fetch('/api/update-move', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ contractAddress, status: 'PLAYER2_JOINED', playerMove }),
                    });
                    console.log('PLAYER2_JOINED');
                } else {
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    async function solve() {
        if (walletClient) {
            await getWalletClient();

            const res = await fetch(`/api/get-challenge`, {
                method: 'POST',
                body: JSON.stringify({ contractAddress }),
            });
            const data = await res.json();
            const c1 = data.c1;
            const salt = process.env.NEXT_PUBLIC_SALT;
            console.log(address);

            const hash = await walletClient.writeContract({
                address: contractAddress as `0x${string}`,
                account: address,
                abi: contractAbi,
                functionName: 'solve',
                chain: sepolia,
                args: [c1, salt],
                gas: BigInt(utils.parseUnits('1000000', 'wei').toString()),
            });

            console.log(hash);

            const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

            console.log(transaction);

            if (transaction.status === 'success') {
                await fetch('/api/update-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ contractAddress, status: 'MOVE_REVEALED' }),
                });
                console.log('MOVE_REVEALED');
            }
        }
    }

    if (gameStatus === 'COMPLETED') return <Button variant="secondary">Game ended</Button>;

    // If player 1
    if (isPlayerOne) {
        if (gameStatus === 'CREATED') {
            return (
                <Button variant="secondary" disabled>
                    Waiting for the opponent
                </Button>
            );
        } else if (gameStatus === 'PLAYER2_JOINED') {
            return <Button onClick={solve}>Reveal your move</Button>;
        } else if (gameStatus === 'MOVE_REVEALED') {
            // Add a winning condition
        } else if (gameStatus === 'PLAYER2_TIMEOUT') {
            return <Button>Payout</Button>;
        }
    } else {
        // if player 2
        if (gameStatus === 'CREATED') {
            return (
                <>
                    <div className="grid w-full max-w-sm items-center gap-2.5">
                        <Label htmlFor="move">Your move</Label>
                        <RadioGroup required id="move" onValueChange={(value) => setMoveValue(value)}>
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
                    <Button onClick={submitMove}>Submit a move</Button>
                </>
            );
        } else if (gameStatus === 'PLAYER2_JOINED') {
            return (
                <Button variant="secondary" disabled>
                    Waiting for the opponent
                </Button>
            );
        } else if (gameStatus === 'MOVE_REVEALED') {
            // Add a winning condition
        } else if (gameStatus === 'PLAYER1_TIMEOUT') {
            return <Button>Payout</Button>;
        }
    }
}
