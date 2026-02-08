# CuidaFlow - Lógica Financeira (Transporte)

## Tabela de Preços

| Tipo | Base (Semana) | Base (FDS) | Ida/Volta ≤20km | Ida/Volta >20km | Por km |
|------|---------------|------------|-----------------|-----------------|--------|
| **Normal** | €20 | €35 | +€50 | +€60 | €0.65 |
| **Adaptado** | €45 | €85 | +€60 | +€80 | €0.65 |

---

## Função Principal

```python
PRICING = {
    'normal': {'base_weekday': 20, 'base_weekend': 35, 'round_short': 50, 'round_long': 60, 'per_km': 0.65},
    'adapted': {'base_weekday': 45, 'base_weekend': 85, 'round_short': 60, 'round_long': 80, 'per_km': 0.65}
}

def calculate_transport_quote(transport_type: str, distance_km: float, travel_date: date, is_round_trip: bool = False):
    prices = PRICING[transport_type]
    is_weekend = travel_date.weekday() >= 5
    
    # 1. Base
    base = prices['base_weekend'] if is_weekend else prices['base_weekday']
    
    # 2. Suplemento viagem
    supplement = 0
    if is_round_trip:
        supplement = prices['round_long'] if distance_km > 20 else prices['round_short']
    
    # 3. Custo km
    km_cost = round(distance_km * prices['per_km'], 2)
    
    # 4. Total
    total = base + supplement + km_cost
    
    return {'base': base, 'supplement': supplement, 'km_cost': km_cost, 'total': total}
```

---

## Exemplos

```python
# Normal, 15km, semana, só ida → €20 + €0 + €9.75 = €29.75
# Adaptado, 25km, FDS, ida/volta → €85 + €80 + €16.25 = €181.25
```
