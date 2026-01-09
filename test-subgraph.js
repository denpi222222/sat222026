/**
 * Диагностический скрипт для проверки сабграфа denis-3
 * Запускать: node test-subgraph.js
 */

const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/111010/denis-3/v0.0.1';

async function fetchSubgraph(query, name) {
    console.log(`\n🔍 Запрос: ${name}`);
    console.log('─'.repeat(50));

    try {
        const response = await fetch(SUBGRAPH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const text = await response.text();
        console.log('📝 Raw response:', text.substring(0, 500));

        const result = JSON.parse(text);

        if (result.errors) {
            console.log('❌ Ошибки:', JSON.stringify(result.errors, null, 2));
            return null;
        }

        console.log('✅ Данные получены:');
        console.log(JSON.stringify(result.data, null, 2));
        return result.data;
    } catch (error) {
        console.log('❌ Ошибка сети:', error.message);
        return null;
    }
}

async function main() {
    console.log('═'.repeat(60));
    console.log('  ДИАГНОСТИКА САБГРАФА DENIS-3');
    console.log('═'.repeat(60));

    // 1. Проверяем схему - какие сущности есть
    await fetchSubgraph(`
    query {
      __schema {
        queryType {
          fields {
            name
          }
        }
      }
    }
  `, 'Схема (доступные сущности)');

    // 2. Статистика контракта (пробуем разные варианты)
    await fetchSubgraph(`
    query {
      contractStats(first: 5) {
        id
        totalCRAABurned
        totalTokensBurned
        totalStars
        currentMonthlyPool
        currentLockedPool
        mainTreasury
        graveyardSize
        lastUpdated
      }
    }
  `, 'contractStats (first: 5)');

    // 3. Глобальная статистика
    await fetchSubgraph(`
    query {
      globalStats(first: 5) {
        id
        totalBurns
        totalClaimed
        totalPings
        totalBreeds
        totalActiveNFTs
        totalInGraveyard
        lastUpdated
      }
    }
  `, 'globalStats (first: 5)');

    // 4. CRAA статистика
    await fetchSubgraph(`
    query {
      craaStats(first: 5) {
        id
        totalSupply
        deadBalance
        lastUpdated
      }
    }
  `, 'craaStats (first: 5)');

    // 5. Попробуем по конкретному ID
    await fetchSubgraph(`
    query {
      contractStats(id: "contract") {
        id
        totalCRAABurned
      }
    }
  `, 'contractStats(id: "contract")');

    await fetchSubgraph(`
    query {
      globalStats(id: "1") {
        id
        totalBurns
      }
    }
  `, 'globalStats(id: "1")');

    console.log('\n' + '═'.repeat(60));
    console.log('  ДИАГНОСТИКА ЗАВЕРШЕНА');
    console.log('═'.repeat(60));
}

main();
