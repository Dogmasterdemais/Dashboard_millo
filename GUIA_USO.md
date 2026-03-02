# Guia de Uso - Dashboard Analítico

## 🎯 Objetivos do Dashboard

Este dashboard foi desenvolvido para extrair e analisar dados de agendamentos de clínicas, oferecendo:

1. **Visualização por Períodos**: Dia, Semana, Mês ou Customizado
2. **Filtros por Convênio**: Análise de agendamentos por plano de saúde
3. **Filtros por Idade**: Separação entre menores e maiores de 18 anos
4. **Gráficos Comparativos**: Visualização interativa por especialidades

---

## 🚀 Como Iniciar

### 1. Instalação
```bash
npm install
```

### 2. Executar o servidor
```bash
npm start
```

O servidor estará disponível em: `http://localhost:3000`

### 3. Acessar o dashboard visual
```bash
http://localhost:3000/index.html
```

Ou abra o arquivo `index.html` diretamente no navegador.

---

## 📊 Endpoints da API

### Agendamentos

#### 1. Listar por Período
```
GET /api/appointments?period=day|week|month|custom
```

**Exemplo - Agendamentos do mês:**
```bash
curl "http://localhost:3000/api/appointments?period=month"
```

**Exemplo - Período customizado:**
```bash
curl "http://localhost:3000/api/appointments?period=custom&startDate=2024-01-15&endDate=2024-01-31"
```

---

#### 2. Filtrar Agendamentos
```
GET /api/appointments/filtered?period=month&insurance=Unimed&ageGroup=over18&specialty=Cardiologia
```

**Exemplos práticos:**

a) Pacientes adultos do mês:
```bash
curl "http://localhost:3000/api/appointments/filtered?period=month&ageGroup=over18"
```

b) Agendamentos de um convênio específico:
```bash
curl "http://localhost:3000/api/appointments/filtered?period=week&insurance=Bradesco_Saude"
```

c) Pediátricos (menores de 18) da semana:
```bash
curl "http://localhost:3000/api/appointments/filtered?period=week&ageGroup=under18"
```

d) Cardiologia para maiores de 18 anos no mês:
```bash
curl "http://localhost:3000/api/appointments/filtered?period=month&specialty=Cardiologia&ageGroup=over18"
```

---

#### 3. Por Convênio
```
GET /api/appointments/by-insurance/{insurance}?period=month
```

**Exemplos:**
```bash
# Unimed no mês
curl "http://localhost:3000/api/appointments/by-insurance/Unimed?period=month"

# Bradesco Saúde na semana
curl "http://localhost:3000/api/appointments/by-insurance/Bradesco_Saude?period=week"
```

---

#### 4. Por Faixa Etária
```
GET /api/appointments/by-age/{ageGroup}?period=day|week|month
```

Onde `{ageGroup}` é: `under18` ou `over18`

**Exemplos:**
```bash
# Menores de 18 anos do dia
curl "http://localhost:3000/api/appointments/by-age/under18?period=day"

# Maiores de 18 anos do mês
curl "http://localhost:3000/api/appointments/by-age/over18?period=month"
```

---

### Análiticas

#### 1. Dashboard Completo
```
GET /api/analytics/dashboard?period=month
```

**Retorna:**
- Total de agendamentos
- Média por dia
- Distribuição por especialidade
- Distribuição por convênio
- Distribuição por faixa etária

**Exemplo:**
```bash
curl "http://localhost:3000/api/analytics/dashboard?period=month"
```

---

#### 2. Distribuição por Especialidade
```
GET /api/analytics/specialty-distribution?period=month
```

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": {
    "labels": ["Cardiologia", "Dermatologia", "Pediatria"],
    "data": [45, 32, 28],
    "total": 105
  }
}
```

**Exemplos de uso:**
```bash
# Mês atual
curl "http://localhost:3000/api/analytics/specialty-distribution?period=month"

# Semana atual
curl "http://localhost:3000/api/analytics/specialty-distribution?period=week"

# Filtrando por convênio
curl "http://localhost:3000/api/analytics/specialty-distribution?period=month&insurance=Unimed"

# Filtrando por faixa etária
curl "http://localhost:3000/api/analytics/specialty-distribution?period=month&ageGroup=over18"
```

---

#### 3. Distribuição por Convênio
```
GET /api/analytics/insurance-distribution?period=month
```

**Exemplo:**
```bash
curl "http://localhost:3000/api/analytics/insurance-distribution?period=month"
```

---

#### 4. Distribuição por Faixa Etária
```
GET /api/analytics/age-distribution?period=month
```

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": {
    "labels": ["Menores de 18 anos", "Maiores de 18 anos"],
    "data": [25, 80],
    "total": 105
  }
}
```

---

#### 5. Comparação por Período
```
GET /api/analytics/specialty-comparison/{specialty}?period1=day&period2=week
```

**Exemplos:**
```bash
# Comparar Cardiologia entre hoje e semana passada
curl "http://localhost:3000/api/analytics/specialty-comparison/Cardiologia?period1=day&period2=week"

# Comparar Pediatria entre semana e mês
curl "http://localhost:3000/api/analytics/specialty-comparison/Pediatria?period1=week&period2=month"
```

---

## 📱 Usando a Interface Web

### Passo 1: Iniciar o servidor
```bash
npm start
```

### Passo 2: Abrir no navegador
- Abra `index.html` no navegador
- URL: `file:///c:/Users/Douglas%20Araújo/Desktop/Dashboard/index.html`

### Passo 3: Usar os filtros
1. **Período**: Selecione Dia, Semana, Mês ou Customizado
2. **Convênio**: Selecione entre os convênios disponíveis
3. **Faixa Etária**: Escolha Menores ou Maiores de 18 anos
4. **Especialidade**: Filtre por tipo de especialidade
5. **Clique em "Carregar Dashboard"**

### Passo 4: Analisar gráficos
- Os gráficos atualizam automaticamente com os filtros selecionados
- Paire o mouse sobre as seções do gráfico para mais detalhes

---

## 🔧 Casos de Uso Práticos

### Caso 1: Análise de Demanda Semanal
**Objetivo**: Quais especialidades são mais agendadas na semana?

```bash
curl "http://localhost:3000/api/analytics/specialty-distribution?period=week"
```

---

### Caso 2: Pacientes Idosos Este Mês
**Objetivo**: Quantos pacientes maiores de 18 anos foram agendados este mês?

```bash
curl "http://localhost:3000/api/appointments/by-age/over18?period=month"
```

---

### Caso 3: Eficiência por Convênio
**Objetivo**: Qual convênio tem mais agendamentos?

```bash
curl "http://localhost:3000/api/analytics/insurance-distribution?period=month"
```

---

### Caso 4: Pediátricos em Período Customizado
**Objetivo**: Quantas crianças foram agendadas entre 01/01 e 15/01?

```bash
curl "http://localhost:3000/api/appointments/filtered?period=custom&startDate=2024-01-01&endDate=2024-01-15&ageGroup=under18"
```

---

### Caso 5: Cardiologia - Análise Comparativa
**Objetivo**: Comparar agendamentos de cardiologia entre hoje e a semana?

```bash
curl "http://localhost:3000/api/analytics/specialty-comparison/Cardiologia?period1=day&period2=week"
```

---

### Caso 6: Convênio Específico + Faixa Etária
**Objetivo**: Adultos da Unimed agendados esta semana?

```bash
curl "http://localhost:3000/api/appointments/filtered?period=week&insurance=Unimed&ageGroup=over18"
```

---

## 📊 Interpretando os Dados

### Dashboard Summary (Resumo)
- **Total de Agendamentos**: Quantidade total na período/filtros selecionados
- **Média por Dia**: Total dividido por número de dias
- **Período**: Que período está sendo analisado

### Gráfico de Especialidades
- Mostra qual especialidade tem mais demanda
- Útil para: Alocação de recursos, planejamento de equipes

### Gráfico de Convênios
- Mostra qual convênio gera mais agendamentos
- Útil para: Negociações, priorização de atendimentos

### Gráfico por Faixa Etária
- Separa entre menores e maiores de 18 anos
- Útil para: Planejamento de pediatria e geriatria

---

## 🐛 Solução de Problemas

### Erro: "Cannot GET /"
**Causa**: O servidor não está iniciado
**Solução**: Execute `npm start` no terminal

### Erro: "Connection refused"
**Causa**: O servidor não está respondendo
**Solução**: Verifique se o Node.js está instalado e execute `npm install`

### Erro ao carregar dados
**Causa**: Problemas de conectividade com Supabase
**Solução**: Verifique as chaves no arquivo `.env`

### Nenhum dado retornado
**Causa**: Pode não haver agendamentos no período/filtros selecionados
**Solução**: Teste com período mais amplo (ex: mês em vez de dia)

---

## 📚 Estrutura dos Dados Esperados

Sua tabela `appointments` no Supabase deve conter:

```sql
- id (INT): Identificador único
- appointment_date (TIMESTAMP): Data e hora do agendamento
- patient_name (VARCHAR): Nome do paciente
- patient_birthdate (DATE): Data de nascimento
- specialty (VARCHAR): Especialidade médica
- insurance (VARCHAR): Convênio/Plano de saúde
- clinic_id (INT): ID da clínica
- created_at (TIMESTAMP): Data de criação do registro
```

---

## 🔐 Notas de Segurança

1. **Nunca commite o `.env`** no GitHub
2. **Mantenha as chaves seguras**
3. **Use a chave `anon` para leitura** simples
4. **Use a chave `service_role` apenas** para operações administrativas
5. **Configure CORS** adequadamente em produção

---

## 📝 Próximas Melhorias Sugeridas

1. Autenticação de usuários
2. Persistência de filtros
3. Exportação de relatórios (PDF/Excel)
4. Gráficos mais avançados (temporal, scatter)
5. Cache de dados
6. Paginação de resultados

---

## 📞 Suporte

Para dúvidas sobre o uso da API, consulte a documentação principal em `README.md`.
