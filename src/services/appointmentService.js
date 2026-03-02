const { supabase } = require('../config/supabase');

// Função auxiliar para obter data no formato correto
const formatDate = (date, type = 'start') => {
  const d = new Date(date);
  if (type === 'end') {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
};

// Função auxiliar para obter data do início do dia
const getStartOfDay = () => {
  return formatDate(new Date(), 'start');
};

// Função auxiliar para obter data do fim do dia
const getEndOfDay = () => {
  return formatDate(new Date(), 'end');
};

// Função auxiliar para obter data do início da semana
const getStartOfWeek = () => {
  const d = new Date();
  const diff = d.getDate() - d.getDay();
  d.setDate(diff);
  return formatDate(d, 'start');
};

// Função auxiliar para obter data do fim da semana
const getEndOfWeek = () => {
  const d = new Date();
  const diff = d.getDate() - d.getDay() + 6;
  d.setDate(diff);
  return formatDate(d, 'end');
};

// Função auxiliar para obter data do início do mês
const getStartOfMonth = () => {
  const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  return formatDate(d, 'start');
};

// Função auxiliar para obter data do fim do mês
const getEndOfMonth = () => {
  const d = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  return formatDate(d, 'end');
};

// Obter agendamentos por período
const getAppointmentsByPeriod = async (period = 'day', startDate = null, endDate = null) => {
  // se pediram período custom sem datas, apenas devolve vazio em vez de erro
  if (period === 'custom' && (!startDate || !endDate)) {
    console.warn('getAppointmentsByPeriod chamado com período custom sem datas; retornando lista vazia');
    return [];
  }

  let dateStart, dateEnd;

  switch (period) {
    case 'day':
      dateStart = getStartOfDay();
      dateEnd = getEndOfDay();
      break;
    case 'week':
      dateStart = getStartOfWeek();
      dateEnd = getEndOfWeek();
      break;
    case 'month':
      dateStart = getStartOfMonth();
      dateEnd = getEndOfMonth();
      break;
    case 'custom':
      if (!startDate || !endDate) {
        console.warn('Período custom sem datas fornecidas, usando dia atual como fallback');
        dateStart = getStartOfDay();
        dateEnd = getEndOfDay();
      } else {
        dateStart = formatDate(new Date(startDate), 'start');
        dateEnd = formatDate(new Date(endDate), 'end');
      }
      break;
    default:
      throw new Error('Período inválido: use day, week, month ou custom');
  }

  try {
    // Query com select * para trazer TODOS os campos
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .gte('data_agendamento', dateStart.split('T')[0])
      .lte('data_agendamento', dateEnd.split('T')[0]);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }
};

// Obter agendamentos com filtro por convênio
const getAppointmentsByInsurance = async (insurance, period = 'day') => {
  let appointments = await getAppointmentsByPeriod(period);
  return appointments.filter(apt => apt.convenio_id === insurance);
};

// Obter agendamentos com filtro por unidade
const getAppointmentsByUnit = async (unitId, period = 'day') => {
  let appointments = await getAppointmentsByPeriod(period);
  return appointments.filter(apt => apt.unidade_id === unitId);
};

// Calcular idade a partir da data de nascimento
const calculateAge = (birthdate) => {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Obter agendamentos com múltiplos filtros
const getAppointmentsFiltered = async (filters = {}) => {
  const {
    period = 'day',
    insurance = null,
    // ageGroup no momento não usado, substituído por minAge/maxAge
    minAge = null,
    maxAge = null,
    specialty = null,
    unitId = null,
    startDate = null,
    endDate = null,
    status = null
  } = filters;

  let appointments = await getAppointmentsByPeriod(period, startDate, endDate);

  if (insurance) {
    appointments = appointments.filter(apt => apt.convenio_id === insurance);
  }

  if (unitId) {
    appointments = appointments.filter(apt => apt.unidade_id === unitId);
  }

  if (specialty) {
    appointments = appointments.filter(apt => apt.modalidade === specialty);
  }

  if (status) {
    appointments = appointments.filter(apt => apt.status === status);
  }

  // se houver filtro por idade, precisamos carregar datas de nascimento
  if (minAge !== null || maxAge !== null) {
    const pacienteIds = [...new Set(appointments.map(a => a.paciente_id).filter(p => p))];
    if (pacienteIds.length > 0) {
      const { data: pacientes, error } = await supabase
        .from('pacientes')
        .select('id, data_nascimento')
        .in('id', pacienteIds);
      if (error) throw error;

      const ageMap = {};
      pacientes?.forEach(p => {
        ageMap[p.id] = calculateAge(p.data_nascimento);
      });

      appointments = appointments.filter(apt => {
        const age = ageMap[apt.paciente_id];
        if (age === undefined || age === null) return false;
        if (minAge !== null && age < Number(minAge)) return false;
        if (maxAge !== null && age > Number(maxAge)) return false;
        return true;
      });

      // also attach age to appointment for convenience
      appointments = appointments.map(apt => ({
        ...apt,
        paciente_age: ageMap[apt.paciente_id] || null,
      }));
    }
  }

  return appointments;
};

// Obter todas as unidades disponíveis
const getAllUnits = async () => {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('unidade_id')
      .not('unidade_id', 'is', null);

    if (error) throw error;

    const uniqueUnits = [...new Set(data.map(apt => apt.unidade_id))];
    return uniqueUnits;
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    throw error;
  }
};

// Obter todas as insurances disponíveis
const getAllInsurances = async () => {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('convenio_id')
      .not('convenio_id', 'is', null);

    if (error) throw error;

    const uniqueInsurances = [...new Set(data.map(apt => apt.convenio_id))];
    return uniqueInsurances;
  } catch (error) {
    console.error('Erro ao buscar convênios:', error);
    throw error;
  }
};

// Obter todas as especialidades/modalidades disponíveis
const getAllSpecialties = async () => {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('modalidade')
      .not('modalidade', 'is', null);

    if (error) throw error;

    const uniqueSpecialties = [...new Set(data.map(apt => apt.modalidade))];
    return uniqueSpecialties;
  } catch (error) {
    console.error('Erro ao buscar especialidades:', error);
    throw error;
  }
};

// Obter estatísticas por unidade com filtros
const getStatisticsByUnit = async (filters = {}) => {
  try {
    const {
      period = 'day',
      startDate = null,
      endDate = null,
      insurance = null,
      minAge = null,
      maxAge = null,
      specialty = null
    } = typeof filters === 'string' ? { period: filters } : filters;

    let appointments = await getAppointmentsByPeriod(period, startDate, endDate);
    
    // Aplicar filtros opcionais
    if (insurance) {
      appointments = appointments.filter(apt => apt.convenio_id === insurance);
    }
    if (specialty) {
      appointments = appointments.filter(apt => apt.modalidade === specialty);
    }
    if (minAge !== null || maxAge !== null) {
      const pacienteIds = [...new Set(appointments.map(a => a.paciente_id).filter(p => p))];
      if (pacienteIds.length > 0) {
        const { data: pacientes, error } = await supabase
          .from('pacientes')
          .select('id, data_nascimento')
          .in('id', pacienteIds);
        if (error) throw error;
        
        const ageMap = {};
        pacientes?.forEach(p => {
          ageMap[p.id] = calculateAge(p.data_nascimento);
        });
        
        appointments = appointments.filter(apt => {
          const age = ageMap[apt.paciente_id];
          if (age === undefined || age === null) return false;
          if (minAge !== null && age < Number(minAge)) return false;
          if (maxAge !== null && age > Number(maxAge)) return false;
          return true;
        });
      }
    }
    
    const statistics = {};
    appointments.forEach(apt => {
      const unitId = apt.unidade_id || 'Sem unidade';
      if (!statistics[unitId]) {
        statistics[unitId] = {
          unitId,
          total: 0,
          agendado: 0,
          faltou: 0,
          cancelado: 0,
          modalidades: {}
        };
      }
      statistics[unitId].total++;
      statistics[unitId][apt.status] = (statistics[unitId][apt.status] || 0) + 1;
      statistics[unitId].modalidades[apt.modalidade] = (statistics[unitId].modalidades[apt.modalidade] || 0) + 1;
    });

    return statistics;
  } catch (error) {
    console.error('Erro ao gerar estatísticas por unidade:', error);
    throw error;
  }
};

module.exports = {
  getAppointmentsByPeriod,
  getAppointmentsByInsurance,
  getAppointmentsByUnit,
  getAppointmentsFiltered,
  getAllUnits,
  getAllInsurances,
  getAllSpecialties,
  calculateAge,
  getStatisticsByUnit,
};
