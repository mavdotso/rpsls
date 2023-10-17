'use client';
import { useWalletClient, useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { contractBytecode, contractAbi } from '../../contracts/contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getWalletClient } from '@wagmi/core';
import { sepolia } from '@wagmi/core/chains';
import { utils } from 'ethers';
import { Loader2, Swords } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MOVES } from '@/lib/consts';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createChallenge } from '@/lib/prisma';
import { parseEther } from 'viem';
import { publicClient } from '@/lib/viemConfitg';

type Challenge = {
    contractAddress: string;
    opponentAddress: string;
    isActive: boolean;
    bet: number;
    userMove: string;
    opponentMove: string;
};

export default function ChallengeForm() {
    const { toast } = useToast();
    const { data: walletClient, isError, isLoading } = useWalletClient();
    const { address, isConnected } = useAccount();

    const [challenges, setChallenges] = useState<Challenge[]>([]);

    const [bet, setBet] = useState<number>(0);
    const [moveValue, setMoveValue] = useState<string>();
    const [opponentAddress, setOpponentAddress] = useState<string>();

    const [isDeploying, setIsDeploying] = useState<boolean>(false);

    async function deployContract() {
        if (!isConnected) {
            handleError('Please, connect your wallet');
            return;
        }
        if (walletClient) {
            try {
                await getWalletClient();
                const playerMove = utils.formatBytes32String(moveValue || '');
                const salt32 = utils.formatBytes32String(process.env.SALT || '');
                const commitment = utils.keccak256(utils.defaultAbiCoder.encode(['bytes32', 'bytes32'], [playerMove, salt32]));
                const stake = BigInt(parseEther(bet.toString()));

                const hash = await walletClient.deployContract({
                    abi: contractAbi,
                    account: address,
                    bytecode: `0x${contractBytecode}`,
                    chain: sepolia,
                    args: [commitment, address],
                    value: stake,
                    gas: BigInt(utils.parseUnits('500000', 'wei').toString()),
                });

                const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

                if (transaction.status === 'success') {
                    // @ts-ignore
                    await createChallenge(address, opponentAddress, commitment, bet);
                    handleSuccess('Your opponent has been challenged!');
                } else {
                    handleError();
                }
            } catch (err) {
                console.log(err);
                handleError();
            }
        } else {
            handleError();
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

    return (
        <div className="flex flex-row gap-4">
            <Card className="w-[420px]">
                <CardHeader>
                    <CardTitle>New challenge</CardTitle>
                    <CardDescription>Create a new challenge</CardDescription>
                </CardHeader>
                <CardContent>
                    <span className="max-w-lg space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="bet">Your bet (in Eth)</Label>
                            <Input required id="bet" placeholder="Your bet" type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} min={0.001} />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="opponent">Your opponent</Label>
                            <Input required id="opponent" placeholder="Opponent address" value={opponentAddress} onChange={(e) => setOpponentAddress(e.target.value)} />
                        </div>
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
                        {isDeploying ? (
                            <Button disabled className="gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Challenging...
                            </Button>
                        ) : (
                            <Button onClick={deployContract}>
                                <Swords className="w-4 h-4 mr-2" /> Challenge
                            </Button>
                        )}
                    </span>
                </CardContent>
            </Card>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Challenges</CardTitle>
                    <CardDescription>Accept or complete the challenge</CardDescription>
                </CardHeader>
                <CardContent>
                    {challenges.map((challenge, index) => (
                        <div key={index}>
                            <div>Contract address: {challenge.contractAddress}</div>
                            <div>Opponent address: {challenge.opponentAddress}</div>
                            <div>Bet: {challenge.bet}</div>
                            <div>Your move: {challenge.userMove}</div>
                            <div>Opponent move: {challenge.opponentMove}</div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Toaster />
        </div>
    );
}
