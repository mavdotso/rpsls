import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

export interface PlayerOneActionsProps {
    isLoading: boolean;
    gameStatus: string;
    winner: string;
    handleSolve: () => void;
    handleJ2Timeout: () => void;
}

export function PlayerOneActions({ isLoading, gameStatus, winner, handleSolve, handleJ2Timeout }: PlayerOneActionsProps) {
    if (gameStatus === 'PLAYER2_TIMEOUT') {
        return (
            <div>
                <p>Player 2 timed out</p>
                {isLoading ? (
                    <Button disabled className="gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Paying out
                    </Button>
                ) : (
                    <Button onClick={handleJ2Timeout}>Payout</Button>
                )}
            </div>
        );
    } else if (gameStatus === 'PLAYER1_TIMEOUT') {
        return (
            <Button variant="secondary" disabled>
                You timed out
            </Button>
        );
    } else if (gameStatus === 'CREATED') {
        return (
            <Button variant="secondary" disabled>
                Waiting for the opponent
            </Button>
        );
    } else if (gameStatus === 'PLAYER2_JOINED') {
        return (
            <>
                {isLoading ? (
                    <Button disabled className="gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Revealing...
                    </Button>
                ) : (
                    <Button onClick={handleSolve}>Reveal your move</Button>
                )}
            </>
        );
    } else if (gameStatus === 'COMPLETED') {
        if (winner === 'j1') {
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
}
