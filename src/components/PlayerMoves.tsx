import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MOVES } from '@/lib/consts';

interface PlayerMovesProps {
    setPlayerMove: (value: string) => void;
}

export function PlayerMoves({ setPlayerMove }: PlayerMovesProps) {
    return (
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
    );
}
