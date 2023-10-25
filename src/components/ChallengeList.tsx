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
        <Card className="w-full">
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
                {challenges.map((challenge, index) => (
                    <div className="flex flex-row gap-8 py-4 items-center" key={index}>
                        <>{index + 1}</>
                        <div>
                            <p className="text-sm text-secondary-foreground">Contract address:</p>{' '}
                            <span className="flex gap-2 items-center">
                                {shortenAddress(challenge.contractAddress)}
                                <a href={`https://sepolia.etherscan.io/address/${challenge.contractAddress}`}>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-secondary-foreground">Opponent address:</p> <span className="flex">{shortenAddress(challenge.j2)}</span>
                        </div>
                        <div>
                            <p className="text-sm text-secondary-foreground">Bet:</p> <span className="flex">{challenge.stake} ETH</span>
                        </div>
                        <div>
                            <p className="text-sm text-secondary-foreground">Status</p>
                            <span className="flex">
                                <PlayerActions
                                    j2={challenge.j2}
                                    gameStatus={challenge.status}
                                    contractAddress={challenge.contractAddress}
                                    stake={challenge.stake}
                                    updatedAt={challenge.updatedAt}
                                    updateStatus={updateStatus}
                                />
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
