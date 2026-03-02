# Dashboard Analítico de Agendamentos de Clínicas

Um dashboard completo em Node.js para análise de agendamentos de clínicas com suporte a filtros, períodos customizáveis e gráficos comparativos.

## 📋 Funcionalidades

### Períodos Disponíveis
- **Dia**: Agendamentos do dia atual
- **Semana**: Agendamentos da semana atual
- **Mês**: Agendamentos do mês atual
- **Customizado**: Período de datas específicas

### Filtros
- **Por Convênio**: Filtre agendamentos por plano de saúde
- **Por Idade**: Separe pacientes menores e maiores de 18 anos
- **Por Especialidade**: Filtre por tipo de especialidade
- **Combinados**: Combine múltiplos filtros em uma única consulta

### Gráficos e Análises
- Distribuição de agendamentos por especialidade
- Distribuição por convênio
- Distribuição por faixa etária
- Comparação de especialidades entre períodos
- Dashboard completo com resumo geral

## 🚀 Instalação

### 1. Pré-requisitos
- Node.js 14+ instalado
- npm ou yarn

### 2. Instalação de Dependências
```bash
npm install
```

### 3. Configuração
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
SUPABASE_URL=https://urpfjihtkvvqehjppbrg.supabase.co
SUPABASE_KEY_ANON=sua_chave_anon
SUPABASE_KEY_SERVICE=sua_chave_service
PORT=3000
NODE_ENV=development
```

## 📦 Estrutura do Projeto

```
project-root/
├── src/
│   ├── config/
│   │   └── supabase.js          # Configuração do cliente Supabase
│   ├── services/
│   │   ├── appointmentService.js # Serviço de agendamentos
│   │   └── analyticsService.js   # Serviço de análiticas
│   ├── routes/
│   │   ├── appointments.js       # Rotas de agendamentos
│   │   └── analytics.js          # Rotas de análiticas
│   └── server.js                 # Arquivo principal da aplicação
├── .env                          # Variáveis de ambiente
├── package.json
└── README.md
```

## 🔧 Uso da API

### Iniciar o servidor
```bash
npm start
```

Para desenvolvimento com hot-reload:
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### Endpoints Disponíveis

#### 1. Agendamentos

**Obter agendamentos por período**
```
GET /api/appointments?period=day
```
Parâmetros:
- `period`: day | week | month | custom
- `startDate`: (obrigatório se period=custom) YYYY-MM-DD
- `endDate`: (obrigatório se period=custom) YYYY-MM-DD

Exemplo:
```bash
curl "http://localhost:3000/api/appointments?period=month"
```

**Obter agendamentos filtrados**
```
GET /api/appointments/filtered?period=day&insurance=Unimed&ageGroup=over18&specialty=Cardiologia
```
Parâmetros:
- `period`: day | week | month | custom
- `insurance`: Nome do convênio (opcional)
- `ageGroup`: under18 | over18 (opcional)
- `specialty`: Nome da especialidade (opcional)
- `startDate`: Necessário se period=custom
- `endDate`: Necessário se period=custom

Exemplo:
```bash
curl "http://localhost:3000/api/appointments/filtered?period=month&ageGroup=over18"
```

**Obter agendamentos por convênio**
```
GET /api/appointments/by-insurance/:insurance?period=day
```

Exemplo:
```bash
curl "http://localhost:3000/api/appointments/by-insurance/Unimed?period=week"
```

**Obter agendamentos por faixa etária**
```
GET /api/appointments/by-age/:ageGroup?period=day
```
Parâmetros de rota:
- `ageGroup`: under18 | over18

Exemplo:
```bash
curl "http://localhost:3000/api/appointments/by-age/under18?period=month"
```

#### 2. Análiticas

**Obter dashboard analítico completo**
```
GET /api/analytics/dashboard?period=day
```

Exemplo:
```bash
curl "http://localhost:3000/api/analytics/dashboard?period=month"
```

Respostas incluem:
- Total de agendamentos
- Média de agendamentos por dia
- Distribuição por especialidade
- Distribuição por convênio
- Distribuição por faixa etária

**Distribuição de especialidades**
```
GET /api/analytics/specialty-distribution?period=day
```

Retorna labels e dados para criar gráfico com Chart.js:
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

**Distribuição de convênios**
```
GET /api/analytics/insurance-distribution?period=day
```

**Distribuição por faixa etária**
```
GET /api/analytics/age-distribution?period=day
```

Retorna:
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

**Comparação de especialidade entre períodos**
```
GET /api/analytics/specialty-comparison/:specialty?period1=day&period2=week
```

Parâmetros:
- `specialty`: Nome da especialidade
- `period1`: day | week | month (padrão: day)
- `period2`: day | week | month (padrão: week)

Exemplo:
```bash
curl "http://localhost:3000/api/analytics/specialty-comparison/Cardiologia?period1=day&period2=week"
```

## 📊 Exemplos de Uso Prático

### Exemplo 1: Listar agendamentos de hoje
```bash
curl "http://localhost:3000/api/appointments?period=day"
```

### Exemplo 2: Agendamentos do mês de um convênio específico
```bash
curl "http://localhost:3000/api/appointments/filtered?period=month&insurance=Unimed"
```

### Exemplo 3: Dashboard da semana atual
```bash
curl "http://localhost:3000/api/analytics/dashboard?period=week"
```

### Exemplo 4: Gráfico de especialidades (mês)
```bash
curl "http://localhost:3000/api/analytics/specialty-distribution?period=month"
```

### Exemplo 5: Análise de pacientes maiores de 18 anos no mês
```bash
curl "http://localhost:3000/api/appointments/filtered?period=month&ageGroup=over18"
```

### Exemplo 6: Período customizado de análise
```bash
curl "http://localhost:3000/api/appointments?period=custom&startDate=2024-01-01&endDate=2024-01-31"
```

## 🗄️ Estrutura Esperada do Banco de Dados (Supabase)

A tabela `appointments` deve ter as seguintes colunas:

```sql
CREATE TABLE appointments (
  id BIGINT PRIMARY KEY,
  appointment_date TIMESTAMP,
  patient_name VARCHAR,
  patient_birthdate DATE,
  specialty VARCHAR,
  insurance VARCHAR,
  clinic_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Campos obrigatórios:
- `appointment_date`: Data e hora do agendamento
- `patient_birthdate`: Data de nascimento do paciente
- `specialty`: Especialidade médica
- `insurance`: Convênio/Plano de saúde

Campos opcionais:
- `patient_name`: Nome do paciente
- `clinic_id`: ID da clínica

## 🔐 Segurança

- As chaves do Supabase estão armazenadas em variáveis de ambiente
- A chave `anon` é usada para operações de leitura simples
- A chave `service_role` pode ser usada para operações administrativas
- Nunca commite o arquivo `.env` no repositório

## 🛠️ Desenvolvimento

### Adicionar novos filtros
Edite `src/services/appointmentService.js` e adicione a lógica de filtro na função `getAppointmentsFiltered()`.

### Adicionar novas análiticas
Crie novas funções em `src/services/analyticsService.js` e exponha-as através de novas rotas em `src/routes/analytics.js`.

### Testar endpoints
Use Postman, Insomnia ou curl para testar os endpoints.

## 📝 Licença

MIT

## 👨‍💻 Suporte

Para dúvidas ou problemas, entre em contato através do repositório do projeto.
