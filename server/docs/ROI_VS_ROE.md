# ROI vs ROE - Финальный анализ

## Проблема

Пользователь заметил различия в значениях ROI между своим приложением и промо-карточками Bybit. Необходимо было разобраться в различиях между ROI и ROE.

## Анализ согласно официальным источникам

### ROI (Return on Investment) - Доходность инвестиций

**Официальное определение:**

- **Формула**: ROI = (Net Profit / Initial Investment) × 100
- **В фьючерсах**: ROI = (Realized P&L / Initial Margin) × 100
- **Используется для**: Закрытых позиций (Closed P&L)

### ROE (Return on Equity) - Доходность собственного капитала

**Официальное определение:**

- **Формула**: ROE = (Net Income / Shareholders Equity) × 100
- **В фьючерсах**: ROE = (Unrealized P&L / Equity) × 100
- **Используется для**: Открытых позиций (Position Info)

## Ключевые различия

| Аспект               | ROI                          | ROE                          |
| -------------------- | ---------------------------- | ---------------------------- |
| **Временной аспект** | Закрытые позиции             | Открытые позиции             |
| **Тип P&L**          | Realized (реализованный)     | Unrealized (нереализованный) |
| **База расчета**     | Initial Margin               | Equity                       |
| **Формула**          | (PnL / Initial Margin) × 100 | (PnL / Equity) × 100         |
| **Цель**             | Эффективность сделки         | Эффективность капитала       |

## Bybit API Implementation

### Closed P&L API (getClosedPnL) → ROI

```javascript
// Поля API
{
  closedPnl: "реализованная прибыль/убыток",
  cumEntryValue: "стоимость позиции",
  leverage: "плечо"
}

// Формула ROI
ROI = (closedPnl / (cumEntryValue / leverage)) × 100
```

### Position Info API (getPositionInfo) → ROE

```javascript
// Поля API
{
  unrealisedPnl: "нереализованная прибыль/убыток",
  equity: "собственный капитал"
}

// Формула ROE
ROE = (unrealisedPnl / equity) × 100
```

## Практический пример

**Одна и та же позиция:**

- Symbol: BTCUSDT Short 100x
- P&L: $100
- Account Balance: $1,000

**Результаты:**

- **ROI (закрытая)**: 200% (на маржу $50)
- **ROE (открытая)**: 9.09% (на капитал $1,100)

**Разница**: 190.91%!
