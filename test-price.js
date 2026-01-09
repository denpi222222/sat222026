/**
 * Диагностический скрипт для получения цены CRAA с DexScreener
 * Запускать: node test-price.js
 */

const CRAA_POOL = '0x7493b5d547c6d9f42ca1133dcd39e2472b633efc';

async function main() {
    console.log('═'.repeat(60));
    console.log('  ПОЛУЧЕНИЕ ЦЕНЫ CRAA');
    console.log('═'.repeat(60));

    // DexScreener API
    const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/pairs/apechain/${CRAA_POOL}`;

    console.log(`\n🔍 Запрос к DexScreener...`);
    console.log(`   URL: ${dexScreenerUrl}`);

    try {
        const response = await fetch(dexScreenerUrl);
        const data = await response.json();

        if (data.pair) {
            const pair = data.pair;
            console.log('\n✅ Данные получены:');
            console.log('─'.repeat(50));
            console.log(`  Pair: ${pair.baseToken?.symbol} / ${pair.quoteToken?.symbol}`);
            console.log(`  Price USD: $${pair.priceUsd}`);
            console.log(`  Price Native (APE): ${pair.priceNative}`);
            console.log(`  Market Cap: $${pair.fdv || pair.marketCap || 'N/A'}`);
            console.log(`  Volume 24h: $${pair.volume?.h24 || 'N/A'}`);
            console.log(`  Price Change 24h: ${pair.priceChange?.h24 || 'N/A'}%`);
            console.log(`  Liquidity: $${pair.liquidity?.usd || 'N/A'}`);
        } else {
            console.log('❌ Пара не найдена:', data);
        }
    } catch (error) {
        console.log('❌ Ошибка:', error.message);
    }

    // GeckoTerminal как альтернатива
    console.log('\n🔍 Запрос к GeckoTerminal...');
    const geckoUrl = `https://api.geckoterminal.com/api/v2/networks/apechain/pools/${CRAA_POOL}`;

    try {
        const response = await fetch(geckoUrl);
        const data = await response.json();

        if (data.data?.attributes) {
            const attrs = data.data.attributes;
            console.log('\n✅ GeckoTerminal данные:');
            console.log('─'.repeat(50));
            console.log(`  Name: ${attrs.name}`);
            console.log(`  Base Token Price USD: $${attrs.base_token_price_usd}`);
            console.log(`  Quote Token Price USD: $${attrs.quote_token_price_usd}`);
            console.log(`  Volume 24h: $${attrs.volume_usd?.h24 || 'N/A'}`);
        } else {
            console.log('❌ Данные не получены:', data);
        }
    } catch (error) {
        console.log('❌ Ошибка GeckoTerminal:', error.message);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('  ПРОВЕРКА ЦЕН ЗАВЕРШЕНА');
    console.log('═'.repeat(60));
}

main();
