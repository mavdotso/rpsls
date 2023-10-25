import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { PlayerMoves } from '../PlayerMoves';

export interface PlayerTwoActionsProps {
    isLoading: boolean;
    gameStatus: string;
    winner: string;
    handleSubmitMove: () => void;
    handleJ1Timeout: () => void;
    setPlayerMove: React.Dispatch<React.SetStateAction<string>>;
}

export function PlayerTwoActions({ isLoading, gameStatus, winner, handleSubmitMove, handleJ1Timeout, setPlayerMove }: PlayerTwoActionsProps) {
    if (gameStatus === 'PLAYER1_TIMEOUT') {
        return (
            <div>
                <p>Player 1 timed out</p>
                {isLoading ? (
                    <Button disabled className="gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Paying out
                    </Button>
                ) : (
                    <Button onClick={handleJ1Timeout}>Payout</Button>
                )}
            </div>
        );
    } else if (gameStatus === 'PLAYER2_TIMEOUT') {
        return (
            <Button variant="secondary" disabled>
                You timed out
            </Button>
        );
    } else if (gameStatus === 'CREATED') {
        return (
            <div>
                <PlayerMoves setPlayerMove={setPlayerMove} />
                {isLoading ? (
                    <Button disabled className="gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </Button>
                ) : (
                    <Button onClick={handleSubmitMove}>Submit a move</Button>
                )}
            </div>
        );
    } else if (gameStatus === 'PLAYER2_JOINED') {
        return (
            <Button variant="secondary" disabled>
                Waiting for the opponent
            </Button>
        );
    } else if (gameStatus === 'COMPLETED') {
        if (winner === 'j1') {
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
