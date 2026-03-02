#!/bin/bash

# Script de teste da API do Dashboard Analítico
# Execute este script quando o servidor estiver rodando: npm start

API_BASE="http://localhost:3000/api"

echo "======================================"
echo "TESTE DA API - DASHBOARD ANALÍTICO"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function test_endpoint() {
    local name=$1
    local endpoint=$2
    
    echo -e "${YELLOW}Testando: $name${NC}"
    echo "URL: $endpoint"
    echo ""
    
    response=$(curl -s "$endpoint")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    echo "---"
    echo ""
}

# Testes de Agendamentos
echo -e "${GREEN}== TESTES DE AGENDAMENTOS ==${NC}"
echo ""

test_endpoint "Agendamentos do Dia" \
    "$API_BASE/appointments?period=day"

test_endpoint "Agendamentos da Semana" \
    "$API_BASE/appointments?period=week"

test_endpoint "Agendamentos do Mês" \
    "$API_BASE/appointments?period=month"

test_endpoint "Agendamentos Filtrados (Mês + Maiores de 18)" \
    "$API_BASE/appointments/filtered?period=month&ageGroup=over18"

test_endpoint "Agendamentos Filtrados (Mês + Menores de 18)" \
    "$API_BASE/appointments/filtered?period=month&ageGroup=under18"

# Testes de Agendamentos por Convênio
echo -e "${GREEN}== TESTES POR CONVÊNIO ==${NC}"
echo ""

# Nota: Substitua "Unimed" pelo convênio disponível no seu banco
test_endpoint "Agendamentos por Convênio (Mês)" \
    "$API_BASE/appointments/filtered?period=month&insurance=Unimed"

# Testes de Agendamentos por Faixa Etária
echo -e "${GREEN}== TESTES POR FAIXA ETÁRIA ==${NC}"
echo ""

test_endpoint "Menores de 18 anos (Dia)" \
    "$API_BASE/appointments/by-age/under18?period=day"

test_endpoint "Maiores de 18 anos (Mês)" \
    "$API_BASE/appointments/by-age/over18?period=month"

# Testes de Análiticas
echo -e "${GREEN}== TESTES DE ANÁLITICAS ==${NC}"
echo ""

test_endpoint "Dashboard Analítico (Mês)" \
    "$API_BASE/analytics/dashboard?period=month"

test_endpoint "Distribuição de Especialidades (Mês)" \
    "$API_BASE/analytics/specialty-distribution?period=month"

test_endpoint "Distribuição de Convênios (Mês)" \
    "$API_BASE/analytics/insurance-distribution?period=month"

test_endpoint "Distribuição por Faixa Etária (Mês)" \
    "$API_BASE/analytics/age-distribution?period=month"

echo -e "${GREEN}== TESTES CONCLUÍDOS ==${NC}"
