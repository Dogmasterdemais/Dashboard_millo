const { supabase } = require('../config/supabase');

// Obter agendamentos com joins para nomes reais e aplicação de filtros (idade, convênio, unidade, especialidade, período, etc.)
const appointmentService = require('./appointmentService');

const getAppointmentsWithNames = async (filters = {}) => {
  // suporte nativo a minAge/maxAge em appointmentService
  const {
    period = 'day',
    startDate = null,
    endDate = null,
    minAge = null,
    maxAge = null,
    insurance = null,
    unitId = null,
    specialty = null,
    status = null
  } = filters;

  // calculadora de idade a partir de data de nascimento
  const calculateAge = dob => {
    if (!dob) return null;
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  try {
    // primeiro obter lista base utilizando as regras de filtro simples
    const agendamentosBase = await appointmentService.getAppointmentsFiltered({
      period,
      startDate,
      endDate,
      insurance,
      unitId,
      specialty,
      status,
      minAge,
      maxAge
    });

    if (!agendamentosBase || agendamentosBase.length === 0) {
      return [];
    }

    // ids únicos para fazer joins
    const pacienteIds = [...new Set(agendamentosBase.map(a => a.paciente_id).filter(p => p))];
    const unidadeIds = [...new Set(agendamentosBase.map(a => a.unidade_id).filter(u => u))];
    const convenioIds = [...new Set(agendamentosBase.map(a => a.convenio_id).filter(c => c))];

    // buscar dados auxiliares
    const pacientesMap = {}; // id -> { nome, dob }
    const unidadesMap = {};
    const conveniosMap = {};

    if (pacienteIds.length > 0) {
      const { data: pacientes } = await supabase
        .from('pacientes')
        .select('id, nome, data_nascimento')
        .in('id', pacienteIds);
      pacientes?.forEach(p => { pacientesMap[p.id] = { nome: p.nome, dob: p.data_nascimento }; });
    }

    if (unidadeIds.length > 0) {
      const { data: unidades } = await supabase
        .from('unidades')
        .select('id, nome')
        .in('id', unidadeIds);
      unidades?.forEach(u => { unidadesMap[u.id] = u.nome; });
    }

    if (convenioIds.length > 0) {
      const { data: convenios } = await supabase
        .from('convenios')
        .select('id, nome')
        .in('id', convenioIds);
      convenios?.forEach(c => { conveniosMap[c.id] = c.nome; });
    }

    // formatar dados finais
    const formatted = agendamentosBase.map(apt => {
      const pat = pacientesMap[apt.paciente_id] || {};
      return {
        id: apt.id,
        data_agendamento: apt.data_agendamento,
        horario_inicio: apt.horario_inicio,
        horario_fim: apt.horario_fim,
        modalidade: apt.modalidade,
        status: apt.status,
        paciente_nome: pat.nome || 'Sem paciente',
        paciente_age: calculateAge(pat.dob) || apt.paciente_age || null,
        paciente_id: apt.paciente_id,
        unidade_nome: unidadesMap[apt.unidade_id] || 'Sem unidade',
        unidade_id: apt.unidade_id,
        convenio_nome: conveniosMap[apt.convenio_id] || 'Sem convênio',
        convenio_id: apt.convenio_id,
      };
    });

    return formatted;
  } catch (error) {
    console.error('Erro ao buscar agendamentos com nomes:', error);
    throw error;
  }
};

// Obter lista de unidades com nomes
const getUnitsWithNames = async () => {
  try {
    const { data, error } = await supabase
      .from('unidades')
      .select('id, nome')
      .eq('is_active', true)
      .order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    throw error;
  }
};

// Obter lista de convênios com nomes
const getInsurancesWithNames = async () => {
  try {
    const { data, error } = await supabase
      .from('convenios')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar convênios:', error);
    throw error;
  }
};

module.exports = {
  getAppointmentsWithNames,
  getUnitsWithNames,
  getInsurancesWithNames,
};
