'use client';
import { useContractWrite } from 'wagmi';
import { contractBytecode, contractAbi } from '../../contracts/contract';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MOVES } from '@/lib/consts';
import { useState } from 'react';
import { Button } from './ui/button';
import { parseEther } from 'viem';

function PlayComponent(contractAddress: string, bet: number) {
    const [moveValue, setMoveValue] = useState<string>();

    // const { data, isLoading, isSuccess, write } = useContractWrite({
    //     contractAddress: contractAddress,
    //     abi: contractAbi,
    //     functionName: 'play',
    // });

    return (
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
            {/* <Button onClick={() => write({ args: [moveValue], value: parseEther(`${bet}`) })}>Accept challenge</Button> */}
        </div>
    );
}
