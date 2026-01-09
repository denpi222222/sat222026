# 🔧 Быстрое исправление CSP ошибок

## ✅ Что исправлено:

### 1. **CSP заголовки** - разрешены inline скрипты для Next.js
### 2. **Middleware** - добавлен `'unsafe-inline'` для продакшена
### 3. **Netlify конфигурация** - убран `'nonce-*'` который вызывал ошибки

## 🚀 Следующие шаги:

### 1. Закоммитьте изменения:
```bash
git add netlify.toml middleware.ts
git commit -m "Fix CSP errors - allow unsafe-inline for Next.js compatibility"
git push
```

### 2. В Netlify Dashboard добавьте переменные:
```
NODE_ENV=production
NEXT_PUBLIC_CHAIN_ID=33139
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x... (ваш адрес)
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x... (ваш адрес)
NEXT_PUBLIC_GAME_PROXY_ADDRESS=0x... (ваш адрес)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Alchemy API Keys (5 ключей для ротации)
NEXT_PUBLIC_ALCHEMY_API_KEY_1=your_alchemy_api_key_1
NEXT_PUBLIC_ALCHEMY_API_KEY_2=your_alchemy_api_key_2
NEXT_PUBLIC_ALCHEMY_API_KEY_3=your_alchemy_api_key_3
NEXT_PUBLIC_ALCHEMY_API_KEY_4=your_alchemy_api_key_4
NEXT_PUBLIC_ALCHEMY_API_KEY_5=your_alchemy_api_key_5
```

### 3. Задеплойте сайт:
- Перейдите в **Deploys**
- Нажмите **Trigger deploy** → **Deploy site**

## ✅ После этого должно работать:
- ✅ Нет CSP ошибок
- ✅ Кошелек подключается
- ✅ Все функции работают
- ✅ Нет ошибок в консоли

**CSP теперь совместим с Next.js и Web3! 🎉** 