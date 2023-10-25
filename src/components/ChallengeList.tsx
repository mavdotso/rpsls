import * as React from 'react';
import { shortenAddress } from '@/lib/utils';
import PlayerActions from './PlayerActions';
import { ExternalLink, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Challenge } from '@/app/page';

interface ChallengeListProps {
    challenges: Challenge[];
    updateStatus: (contractAddress: string, status: string) => Promise<void>;
    handleRefresh: () => void;
}

export function ChallengeList({ challenges, updateStatus, handleRefresh }: ChallengeListProps) {
    return (
        <Card className="flex-grow">
            <CardHeader>
                <div className="flex justify-between">
                    <div>
                        <CardTitle>Challenges</CardTitle>
                        <CardDescription>Accept or complete the challenge</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleRefresh}>
                        <RefreshCcw className="w-3 h-3" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-10 gap-4 py-4 items-center">
                    <div className="col-span-1 text-sm text-secondary-foreground">#</div>
                    <div className="col-span-2 text-sm text-secondary-foreground">Contract address:</div>
                    <div className="col-span-2 text-sm text-secondary-foreground">Opponent address:</div>
                    <div className="col-span-2 text-sm text-secondary-foreground">Bet:</div>
                    <div className="col-span-3 text-sm text-secondary-foreground">Status</div>
                    {challenges.map((challenge, index) => (
                        <React.Fragment key={index}>
                            <div className="col-span-1">{index + 1}</div>
                            <div className="col-span-2 flex gap-2 items-center">
                                {shortenAddress(challenge.contractAddress)}
                                <a href={`https://sepolia.etherscan.io/address/${challenge.contractAddress}`}>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <div className="col-span-2 flex">{shortenAddress(challenge.j2)}</div>
                            <div className="col-span-2 flex">{challenge.stake} ETH</div>
                            <div className="col-span-3 flex">
                                <PlayerActions
                                    j2={challenge.j2}
                                    gameStatus={challenge.status}
                                    contractAddress={challenge.contractAddress}
                                    stake={challenge.stake}
                                    updatedAt={challenge.updatedAt}
                                    updateStatus={updateStatus}
                                />
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
