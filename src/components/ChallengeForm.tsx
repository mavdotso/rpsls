import React, { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Swords } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/toaster';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerMoves } from './PlayerMoves';

interface ChallengeFormProps {
    bet: number;
    setBet: Dispatch<SetStateAction<number>>;
    opponentAddress: string;
    setOpponentAddress: Dispatch<SetStateAction<string>>;
    setPlayerMove: Dispatch<SetStateAction<string>>;
    isDeploying: boolean;
    handleDeployContract: () => void;
}

export default function ChallengeForm({ bet, setBet, opponentAddress, setOpponentAddress, setPlayerMove, isDeploying, handleDeployContract }: ChallengeFormProps) {
    return (
        <div className="flex flex-row gap-4 items-start max-lg:flex-wrap">
            <Card className="w-[420px]">
                <CardHeader>
                    <CardTitle>New challenge</CardTitle>
                    <CardDescription>Create a new challenge</CardDescription>
                </CardHeader>
                <CardContent>
                    <span className="max-w-lg space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="bet">Your bet (in Eth)</Label>
                            <Input required id="bet" placeholder="Your bet" type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} step={0.005} min={0.001} />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="opponent">Your opponent</Label>
                            <Input required id="opponent" placeholder="Opponent address" value={opponentAddress} onChange={(e) => setOpponentAddress(e.target.value)} />
                        </div>
                        <PlayerMoves setPlayerMove={setPlayerMove} />
                        {isDeploying ? (
                            <Button disabled className="gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Challenging...
                            </Button>
                        ) : (
                            <Button onClick={handleDeployContract}>
                                <Swords className="w-4 h-4 mr-2" /> Challenge
                            </Button>
                        )}
                    </span>
                </CardContent>
            </Card>
            <Toaster />
        </div>
    );
}
