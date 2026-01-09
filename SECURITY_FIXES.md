# Исправления безопасности и ошибок

## 1. Ошибка "Unchecked runtime.lastError"

### Проблема
Ошибка `Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.` возникает из-за конфликтов с расширениями браузера.

### Решения

#### A. Добавить обработку ошибок расширений
```javascript
// В main layout или app.tsx
useEffect(() => {
  // Подавление ошибок расширений браузера
  const originalError = console.error;
  console.error = (...args) => {
    if (
      args[0]?.includes?.('runtime.lastError') ||
      args[0]?.includes?.('Could not establish connection') ||
      args[0]?.includes?.('Receiving end does not exist')
    ) {
      return; // Игнорируем ошибки расширений
    }
    originalError.apply(console, args);
  };

  return () => {
    console.error = originalError;
  };
}, []);
```

#### B. Улучшить Content Security Policy
```javascript
// В next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss: ws:",
              "frame-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ];
  }
};
```

#### C. Добавить проверку доступности Web3
```javascript
// В Web3 компонентах
const checkWeb3Availability = () => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      return true;
    }
  } catch (error) {
    console.warn('Web3 provider not available:', error);
  }
  return false;
};
```

## 2. Исправления переводов

### Проблема
Ключи переводов отображались как `**burn.confirmDialog.title**` вместо переведенного текста.

### Решение ✅ ИСПРАВЛЕНО
- Обновлены все ключи переводов в `BurnCard.tsx`
- Используются правильные пути: `sections.burn.feeBox.confirmDialog.*`
- Добавлены fallback значения для всех переводов

## 3. Рекомендации по безопасности

### A. Защита от XSS
```javascript
// Санитизация пользовательского ввода
import DOMPurify from 'dompurify';

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input);
};
```

### B. Защита от CSRF
```javascript
// Добавить CSRF токены для критических операций
const generateCSRFToken = () => {
  return crypto.randomUUID();
};
```

### C. Валидация Web3 транзакций
```javascript
// Проверка параметров транзакций
const validateTransaction = (tx) => {
  if (!tx.to || !tx.value || !tx.data) {
    throw new Error('Invalid transaction parameters');
  }
  
  // Проверка адрес�� контракта
  if (!isValidContractAddress(tx.to)) {
    throw new Error('Invalid contract address');
  }
  
  return true;
};
```

### D. Защита приватных ключей
```javascript
// Никогда не логировать приватные данные
const safeLog = (data) => {
  const sanitized = { ...data };
  delete sanitized.privateKey;
  delete sanitized.mnemonic;
  delete sanitized.seed;
  console.log(sanitized);
};
```

## 4. Мониторинг безопасности

### A. Логирование подозрительной активности
```javascript
const securityLogger = {
  logSuspiciousActivity: (event, details) => {
    console.warn(`[SECURITY] ${event}:`, details);
    // Отправка в систему мониторинга
  }
};
```

### B. Rate limiting
```javascript
const rateLimiter = new Map();

const checkRateLimit = (address, action) => {
  const key = `${address}:${action}`;
  const now = Date.now();
  const limit = rateLimiter.get(key) || { count: 0, resetTime: now + 60000 };
  
  if (now > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = now + 60000;
  }
  
  if (limit.count >= 10) {
    throw new Error('Rate limit exceeded');
  }
  
  limit.count++;
  rateLimiter.set(key, limit);
};
```

## 5. Статус исправлений

- ✅ **Переводы в диалоге сжигания** - ИСПРАВЛЕНО
- ⚠️ **Runtime.lastError** - Требует внедрения обработчика ошибок
- 🔄 **CSP улучшения** - Рекомендуется к внедрению
- 🔄 **Дополнительная валидация** - Рекомендуется к внедрению

## 6. Следующие шаги

1. Внедрить обработчик ошибок расширений браузера
2. Обновить Content Security Policy
3. Добавить дополнительную валидацию Web3 транзакций
4. Настроить мониторинг безопасности
5. Провести аудит безопасности всех компонентов

## 7. Тестирование

Для проверки исправлений:

1. **Переводы**: Откройте раздел Burn и проверьте диалог подтверждения
2. **Runtime errors**: Откройте DevTools и проверьте отсутствие ошибок расширений
3. **Web3 безопасность**: Протестируйте все транзакции с невалидными данными