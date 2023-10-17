'use client';
import { contractBytecode, contractAbi } from '../../contracts/contract';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

export default function ChallengesTable() {
    const { address, isConnected } = useAccount();
    const deployedContracts = [];

    useEffect(() => {
        // getDeployedContracts(address, contractAbi);
    }, [address]);

    return <span></span>;
}
