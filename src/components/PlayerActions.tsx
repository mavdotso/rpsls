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
                await getWalletClient();
                const playerMove = moveValue && MOVES.indexOf(moveValue);
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
                    await fetch('/api/update-status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ contractAddress, status: 'PLAYER2_JOINED', playerMove }),
                    });
                    console.log('Move submitted');
                } else {
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    async function solve() {
        if (walletClient) {
            const res = await await fetch(`/api/get-challenge`, {
                method: 'POST',
                body: JSON.stringify({ contractAddress }),
            });
            const data = await res.json();
            const p1Hash = data.c1Hash;

            const hash = await walletClient.writeContract({
                address: contractAddress as `0x${string}`,
                account: address,
                abi: contractAbi,
                functionName: 'solve',
                chain: sepolia,
                args: [],
                gas: BigInt(utils.parseUnits('1000000', 'wei').toString()),
            });
        }
    }

    if (gameStatus === 'COMPLETED') return <Button variant="secondary">Game ended</Button>;

    // If player 1
    if (isPlayerOne) {
        if (gameStatus === 'CREATED') {
            return <Button variant="secondary">Waiting for the opponent</Button>;
        } else if (gameStatus === 'PLAYER2_JOINED') {
            return <Button>Reveal the move</Button>;
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
            return <Button variant="secondary">Waiting for the opponent</Button>;
        } else if (gameStatus === 'MOVE_REVEALED') {
            // Add a winning condition
        } else if (gameStatus === 'PLAYER1_TIMEOUT') {
            return <Button>Payout</Button>;
        }
    }
}
