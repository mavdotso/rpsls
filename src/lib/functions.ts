async function submitMove() {
    try {
        const playerMove = moveValue && MOVES.indexOf(moveValue) + 1; // add one because in the contract 0 is null
        const bet = BigInt(parseEther(stake.toString()));

        const hash = await walletClient.writeContract({
            address: contractAddress as `0x${string}`,
            account: address,
            abi: contractAbi,
            functionName: 'play',
            chain: sepolia,
            args: [playerMove],
            value: bet,
            gas: BigInt(utils.parseUnits('1000000', 'wei').toString()),
        });

        const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

        if (transaction.status === 'success') {
            await fetch('/api/update-move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractAddress, status: 'PLAYER2_JOINED', playerMove }),
            });
            console.log('PLAYER2_JOINED');
        } else {
        }
    } catch (err) {
        console.log(err);
    }
}

async function solve() {
    await getWalletClient();

    const res = await fetch(`/api/get-challenge`, {
        method: 'POST',
        body: JSON.stringify({ contractAddress }),
    });
    const data = await res.json();
    const c1 = data.c1;
    const salt = process.env.NEXT_PUBLIC_SALT;
    console.log(address);

    const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        account: address,
        abi: contractAbi,
        functionName: 'solve',
        chain: sepolia,
        args: [c1, salt],
        gas: BigInt(utils.parseUnits('1000000', 'wei').toString()),
    });

    console.log(hash);

    const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

    console.log(transaction);

    if (transaction.status === 'success') {
        await fetch('/api/update-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contractAddress, status: 'MOVE_REVEALED' }),
        });
        console.log('MOVE_REVEALED');
    }
}
