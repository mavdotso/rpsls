import { MOVES } from './consts';
import { parseEther } from 'viem';
import { contractAbi, contractBytecode } from '../../contracts/contract';
import { sepolia } from '@wagmi/core/chains';
import { utils } from 'ethers';
import { publicClient } from './viemConfitg';
import { getPlayerMoveIndex } from './utils';

const salt = process.env.NEXT_PUBLIC_SALT;
const gas = BigInt(utils.parseUnits('1000000', 'wei').toString());

export async function deployContract(playerMove: string, bet: number, walletClient: any, userAddress: string, opponentAddress: string) {
    const playerMoveIndex = getPlayerMoveIndex(playerMove);
    const commitment = utils.solidityKeccak256(['uint8', 'uint256'], [playerMoveIndex, salt]);
    const betInt = BigInt(parseEther(bet.toString()));

    const hash = await walletClient.deployContract({
        abi: contractAbi,
        account: userAddress,
        bytecode: `0x${contractBytecode}`,
        chain: sepolia,
        args: [commitment, opponentAddress],
        value: betInt,
        gas: gas,
    });

    return hash;
}

export async function submitMove(playerMove: string, bet: number, contractAddress: string, walletClient: any, userAddress: string) {
    const playerMoveIndex = getPlayerMoveIndex(playerMove);
    const betInt = BigInt(parseEther(bet.toString()));

    const hash = await walletClient.writeContract({
        address: contractAddress,
        account: userAddress,
        abi: contractAbi,
        functionName: 'play',
        chain: sepolia,
        args: [playerMoveIndex],
        value: betInt,
        gas: gas,
    });

    return hash;
}

export async function solve(c1: number, contractAddress: string, walletClient: any, userAddress: string) {
    const hash = await walletClient.writeContract({
        address: contractAddress,
        account: userAddress,
        abi: contractAbi,
        functionName: 'solve',
        chain: sepolia,
        args: [c1, salt],
        gas: gas,
    });

    return hash;
}

export async function j1Timeout(walletClient: any, contractAddress: string, userAddress: string) {
    const hash = await walletClient.writeContract({
        address: contractAddress,
        account: userAddress,
        abi: contractAbi,
        functionName: 'j1Timeout',
        chain: sepolia,
        gas: gas,
    });

    return hash;
}

export async function j2Timeout(walletClient: any, contractAddress: string, userAddress: string) {
    const hash = await walletClient.writeContract({
        address: contractAddress,
        account: userAddress,
        abi: contractAbi,
        functionName: 'j2Timeout',
        chain: sepolia,
        gas: gas,
    });

    return hash;
}

export async function getWinner(contractAddress: `0x${string}`, c1: number, playerMove: string) {
    const c2 = getPlayerMoveIndex(playerMove);
    const winner = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'win',
        args: [c1, c2],
    });

    return winner;
}
