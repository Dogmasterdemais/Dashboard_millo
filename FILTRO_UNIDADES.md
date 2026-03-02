# Guia de Filtro de Unidades - Dashboard Analítico

## 🏢 Novo Filtro: Comparativo de Unidades

O dashboard agora permite análise comparativa entre diferentes unidades/clínicas dos seus agendamentos.

---

## 📊 Endpoints Disponíveis

### 1. Listar Agendamentos por Unidade
```
GET /api/appointments/by-unit/{unitId}?period=day
```

**Parâmetros de rota:**
- `unitId`: ID da unidade (UUID)

**Parâmetros de query:**
- `period`: day | week | month (padrão: day)

**Exemplo:**
```bash
curl "http://localhost:3000/api/appointments/by-unit/79fdd1c5-ec65-4301-8320-760f10e82969?period=month"
```

---

### 2. Filtrar Agendamentos com Unidade
```
GET /api/appointments/filtered?period=month&unitId={unitId}
```

**Parâmetros de query:**
- `period`: day | week | month | custom
- `unitId`: ID da unidade (opcional)
- `insurance`: ID do convênio (opcional)
- `specialty`: Modalidade (opcional)
- `status`: Status do agendamento (opcional)
- `startDate`: Data inicial para custom (opcional)
- `endDate`: Data final para custom (opcional)

**Exemplos:**
```bash
# Agendamentos de uma unidade específica no mês
curl "http://localhost:3000/api/appointments/filtered?period=month&unitId=79fdd1c5-ec65-4301-8320-760f10e82969"

# Agendamentos de uma unidade + convênio específico
curl "http://localhost:3000/api/appointments/filtered?period=month&unitId=79fdd1c5-ec65-4301-8320-760f10e82969&insurance=ffffffff-ffff-ffff-ffff-ffffffffffff"

# Neuropsicologia de uma unidade na semana
curl "http://localhost:3000/api/appointments/filtered?period=week&unitId=79fdd1c5-ec65-4301-8320-760f10e82969&specialty=Neuropsicologia"
```

---

### 3. Distribuição de Agendamentos por Unidade
```
GET /api/analytics/unit-distribution?period=month
```

**Parâmetros de query:**
- `period`: day | week | month (padrão: day)
- `specialty`: Filtrar por especialidade (opcional)
- `insurance`: Filtrar por convênio (opcional)

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": {
    "labels": [
      "79fdd1c5-ec65-4301-8320-760f10e82969",
      "35d35b81-d5cc-40d5-8647-960bf59b6441",
      "293e226b-d1b6-42b6-a23f-ac4f16929f70"
    ],
    "data": [45, 32, 28],
    "total": 105
  }
}
```

---

### 4. Comparativo Detalhado de Unidades ⭐ **PRINCIPAL**
```
GET /api/analytics/unit-comparison?period=month
```

**Parâmetros de query:**
- `period`: day | week | month (padrão: day)
- `specialty`: Filtrar por especialidade (opcional)
- `insurance`: Filtrar por convênio (opcional)

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": {
    "units": [
      {
        "unitId": "79fdd1c5-ec65-4301-8320-760f10e82969",
        "total": 45,
        "agendado": 40,
        "faltou": 3,
        "cancelado": 2,
        "modalidades": {
          "Neuropsicologia": 28,
          "Psicologia": 12,
          "Anamnese": 5
        }
      },
      {
        "unitId": "35d35b81-d5cc-40d5-8647-960bf59b6441",
        "total": 32,
        "agendado": 30,
        "faltou": 1,
        "cancelado": 1,
        "modalidades": {
          "Neuropsicologia": 20,
          "Psicologia": 12
        }
      }
    ],
    "totalAppointments": 105,
    "averagePerUnit": "35.00"
  }
}
```

---

## 🎯 Casos de Uso Prático

### Caso 1: Qual unidade teve mais agendamentos este mês?
```bash
curl "http://localhost:3000/api/analytics/unit-comparison?period=month"
```

**Interpretação**: Visualize todas as unidades ordenadas por total de agendamentos.

---

### Caso 2: Comparar taxa de adesão entre unidades
```bash
curl "http://localhost:3000/api/analytics/unit-comparison?period=month"
```

**Interpretação**: Analise `agendado` vs `faltou` por unidade para medir adesão.

---

### Caso 3: Qual unidade oferece mais Neuropsicologia?
```bash
curl "http://localhost:3000/api/analytics/unit-comparison?period=month&specialty=Neuropsicologia"
```

**Interpretação**: Veja distribuição de Neuropsicologia entre unidades.

---

### Caso 4: Agendamentos por unidade em período customizado
```bash
curl "http://localhost:3000/api/appointments/filtered?period=custom&startDate=2025-12-01&endDate=2025-12-31&unitId=79fdd1c5-ec65-4301-8320-760f10e82969"
```

---

### Caso 5: Comparar demanda de convênio entre unidades
```bash
curl "http://localhost:3000/api/analytics/unit-comparison?period=month&insurance=ffffffff-ffff-ffff-ffff-ffffffffffff"
```

---

## 📋 Campos Retornados no Comparativo

| Campo | Descrição |
|-------|-----------|
| `unitId` | ID da unidade |
| `total` | Total de agendamentos |
| `agendado` | Agendamentos confirmados |
| `faltou` | Pacientes que faltaram |
| `cancelado` | Agendamentos cancelados |
| `modalidades` | Distribuição por tipo de atendimento |

---

## 💡 Métricas Úteis

### Taxa de Adesão
```
Taxa = (Total - Faltou) / Total * 100%
```

### Taxa de Comparecimento Efetivo
```
Taxa = Agendado / Total * 100%
```

### Especialidade Mais Demandada por Unidade
```
Verificar a modalidade com maior valor em "modalidades"
```

---

## 🔍 Filtragem em Tempo Real

O dashboard web já foi atualizado com:
- ✅ Novo filtro "Unidade" nos filtros
- ✅ Novo gráfico "Comparativo de Unidades"
- ✅ Integração automática com os endpoints

---

## 📊 Exemplo de JSON Completo

```json
{
  "success": true,
  "data": {
    "units": [
      {
        "unitId": "79fdd1c5-ec65-4301-8320-760f10e82969",
        "total": 45,
        "agendado": 40,
        "faltou": 3,
        "cancelado": 2,
        "modalidades": {
          "Neuropsicologia": 28,
          "Psicologia": 12,
          "Anamnese": 5
        }
      },
      {
        "unitId": "35d35b81-d5cc-40d5-8647-960bf59b6441",
        "total": 32,
        "agendado": 30,
        "faltou": 1,
        "cancelado": 1,
        "modalidades": {
          "Neuropsicologia": 20,
          "Psicologia": 12
        }
      },
      {
        "unitId": "293e226b-d1b6-42b6-a23f-ac4f16929f70",
        "total": 28,
        "agendado": 25,
        "faltou": 2,
        "cancelado": 1,
        "modalidades": {
          "Neuropsicologia": 18,
          "Psicologia": 10
        }
      }
    ],
    "totalAppointments": 105,
    "averagePerUnit": "35.00"
  }
}
```

---

## 🚀 Próximas Funcionalidades Sugeridas

1. **Ranking de Unidades**: Ordenação por diferentes métricas (taxa de adesão, receita, etc)
2. **Análise Temporal**: Gráficos de tendência por unidade
3. **Alerta de Desempenho**: Notificar quando unidade tem taxa de falta > X%
4. **Relatório Comparativo**: Exportar comparação entre unidades em PDF
5. **KPIs por Unidade**: Dashboard específico para cada unidade

---

## 🆘 Troubleshooting

**Problema**: Nenhuma unidade retornada
- **Solução**: Verifique se há dados com `unidade_id` na tabela `agendamentos`

**Problema**: UnitId inválido
- **Solução**: Use `unitId` no formato UUID exato do seu banco

**Problema**: Dados de modalidades vazios
- **Solução**: Certifique-se que existe campo `modalidade` preenchido nos registros

---

SQL para verificar unidades disponíveis:
```sql
SELECT DISTINCT unidade_id 
FROM agendamentos 
WHERE unidade_id IS NOT NULL 
LIMIT 10;
```
