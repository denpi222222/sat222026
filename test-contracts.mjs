/**
 * Диагностический скрипт для прямых запросов к контрактам на ApeChain
 * Запускать: node test-contracts.mjs
 */

import { createPublicClient, http, formatEther } from 'viem';

// ApeChain конфигурация
const apeChain = {
    id: 33139,
    name: 'ApeChain',
    nativeCurrency: { name: 'APE', symbol: 'APE', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.apechain.com'] }
    }
};

// Адреса контрактов
const CONTRACTS = {
    gameProxy: '0x7dFb75F1000039D650A4C2B8a068f53090e857dD',
    crazyCubeNFT: '0x606a47707d5aEdaE9f616A6f1853fE3075bA740B',
    craaToken: '0xBb526D657Cc1Ba772469A6EC96AcB2ed9D2A93e5',
    deadAddress: '0x000000000000000000000000000000000000dEaD'
};

// ABI для чтения данных
const GAME_PROXY_ABI = [
    { type: 'function', name: 'monthlyPool', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'lockedPool', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'mainTreasury', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'graveyardSize', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'totalStars', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'rewardRatePerSecond', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'breedCost', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'pingInterval', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'breedCooldown', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'graveyardCooldown', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'manualFloorPrice', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
];

const ERC20_ABI = [
    { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'balanceOf', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
];

const NFT_ABI = [
    { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
];

async function main() {
    console.log('═'.repeat(60));
    console.log('  ПРЯМЫЕ ЗАПРОСЫ К КОНТРАКТАМ APECHAIN');
    console.log('═'.repeat(60));

    const client = createPublicClient({
        chain: apeChain,
        transport: http('https://rpc.apechain.com')
    });

    console.log('\n🔗 Подключение к ApeChain RPC...');

    // Проверка блока
    try {
        const blockNumber = await client.getBlockNumber();
        console.log(`✅ Текущий блок: ${blockNumber}`);
    } catch (e) {
        console.log('❌ Ошибка подключения к RPC:', e.message);
        return;
    }

    // Функция безопасного чтения
    async function safeRead(abi, address, functionName, args = []) {
        try {
            const result = await client.readContract({
                address,
                abi,
                functionName,
                args
            });
            return result;
        } catch (e) {
            return `ERROR: ${e.message.substring(0, 80)}`;
        }
    }

    console.log('\n📊 Game Proxy Contract:');
    console.log('─'.repeat(50));

    const gameData = {
        monthlyPool: await safeRead(GAME_PROXY_ABI, CONTRACTS.gameProxy, 'monthlyPool'),
        lockedPool: await safeRead(GAME_PROXY_ABI, CONTRACTS.gameProxy, 'lockedPool'),
        mainTreasury: await safeRead(GAME_PROXY_ABI, CONTRACTS.gameProxy, 'mainTreasury'),
        graveyardSize: await safeRead(GAME_PROXY_ABI, CONTRACTS.gameProxy, 'graveyardSize'),
        totalStars: await safeRead(GAME_PROXY_ABI, CONTRACTS.gameProxy, 'totalStars'),
        rewardRatePerSecond: await safeRead(GAME_PROXY_ABI, CONTRACTS.gameProxy, 'rewardRatePerSecond'),
        breedCost: await safeRead(GAME_PROXY_ABI, CONTRACTS.gameProxy, 'breedCost'),
        pingInterval: await safeRead(GAME_PROXY_ABI, CONTRACTS.gameProxy, 'pingInterval'),
        breedCooldown: await safeRead(GAME_PROXY_ABI, CONTRACTS.gameProxy, 'breedCooldown'),
        graveyardCooldown: await safeRead(GAME_PROXY_ABI, CONTRACTS.gameProxy, 'graveyardCooldown'),
        manualFloorPrice: await safeRead(GAME_PROXY_ABI, CONTRACTS.gameProxy, 'manualFloorPrice'),
    };

    for (const [key, value] of Object.entries(gameData)) {
        if (typeof value === 'bigint') {
            const eth = parseFloat(formatEther(value));
            console.log(`  ${key}: ${value} (${eth.toFixed(2)} CRAA)`);
        } else {
            console.log(`  ${key}: ${value}`);
        }
    }

    console.log('\n💰 CRAA Token:');
    console.log('─'.repeat(50));

    const craaSupply = await safeRead(ERC20_ABI, CONTRACTS.craaToken, 'totalSupply');
    const craaDead = await safeRead(ERC20_ABI, CONTRACTS.craaToken, 'balanceOf', [CONTRACTS.deadAddress]);

    if (typeof craaSupply === 'bigint') {
        console.log(`  Total Supply: ${craaSupply} (${parseFloat(formatEther(craaSupply)).toFixed(0)} CRAA)`);
    } else {
        console.log(`  Total Supply: ${craaSupply}`);
    }

    if (typeof craaDead === 'bigint') {
        console.log(`  Dead Balance (burned): ${craaDead} (${parseFloat(formatEther(craaDead)).toFixed(0)} CRAA)`);
    } else {
        console.log(`  Dead Balance: ${craaDead}`);
    }

    console.log('\n🎨 NFT Collection:');
    console.log('─'.repeat(50));

    const nftSupply = await safeRead(NFT_ABI, CONTRACTS.crazyCubeNFT, 'totalSupply');
    console.log(`  Total NFTs: ${nftSupply}`);

    console.log('\n' + '═'.repeat(60));
    console.log('  ДИАГНОСТИКА КОНТРАКТОВ ЗАВЕРШЕНА');
    console.log('═'.repeat(60));
}

main().catch(console.error);
