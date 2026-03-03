const { supabase } = require('../config/supabase');

// Caches para dados estáticos
let unitsCache = null;
let insuranceCache = null;
let cacheTimestamps = {
  units: null,
  insurance: null
};

const CACHE_DURATION = 3600000; // 1 hora em milissegundos

// Calculadora de idade a partir de data de nascimento
const calculateAge = dob => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Função auxiliar para obter data no formato correto
const formatDate = (date, type = 'start') => {
  const d = new Date(date);
  if (type === 'end') {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString().split('T')[0];
};

// Funções auxiliares para obter datas de período
const getStartOfDay = () => formatDate(new Date(), 'start');
const getEndOfDay = () => formatDate(new Date(), 'end');

const getStartOfWeek = () => {
  const d = new Date();
  const dayOfWeek = d.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const ms = 24 * 60 * 60 * 1000;
  const startOfWeek = new Date(d.getTime() - (daysToSubtract * ms));
  return formatDate(startOfWeek, 'start');
};

const getEndOfWeek = () => {
  const d = new Date();
  const dayOfWeek = d.getDay();
  const daysToAdd = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const ms = 24 * 60 * 60 * 1000;
  const endOfWeek = new Date(d.getTime() + (daysToAdd * ms));
  return formatDate(endOfWeek, 'end');
};

const getStartOfMonth = () => {
  const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  return formatDate(d, 'start');
};

const getEndOfMonth = () => {
  const d = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  return formatDate(d, 'end');
};

// Obter datas baseado no período
const getDateRangeByPeriod = (period = 'day', startDate = null, endDate = null) => {
  switch (period) {
    case 'day':
      return { dateStart: getStartOfDay(), dateEnd: getEndOfDay() };
    case 'week':
      return { dateStart: getStartOfWeek(), dateEnd: getEndOfWeek() };
    case 'month':
      return { dateStart: getStartOfMonth(), dateEnd: getEndOfMonth() };
    case 'custom':
      if (!startDate || !endDate) {
        return { dateStart: getStartOfDay(), dateEnd: getEndOfDay() };
      }
      return {
        dateStart: formatDate(new Date(startDate), 'start'),
        dateEnd: formatDate(new Date(endDate), 'end')
      };
    default:
      return { dateStart: getStartOfDay(), dateEnd: getEndOfDay() };
  }
};

const getAppointmentsWithNames = async (filters = {}) => {
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

  try {
    const { dateStart, dateEnd } = getDateRangeByPeriod(period, startDate, endDate);
    
    // Buscar agendamentos base com filtros
    let query = supabase
      .from('agendamentos')
      .select('*')
      .gte('data_agendamento', dateStart)
      .lte('data_agendamento', dateEnd);

    // Aplicar filtros diretamente no banco para reduzir dados
    if (insurance) {
      query = query.eq('convenio_id', insurance);
    }
    if (unitId) {
      query = query.eq('unidade_id', unitId);
    }
    if (specialty) {
      query = query.eq('modalidade', specialty);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: appointments, error } = await query;
    if (error) throw error;

    if (!appointments || appointments.length === 0) {
      return [];
    }

    // Extrair IDs únicos para consultas paralelas
    const pacienteIds = [...new Set(appointments.map(a => a.paciente_id).filter(p => p))];
    const unidadeIds = [...new Set(appointments.map(a => a.unidade_id).filter(u => u))];
    const convenioIds = [...new Set(appointments.map(a => a.convenio_id).filter(c => c))];

    // Fazer 3 consultas em PARALELO (não sequencialmente)
    const [pacientesRes, unidadesRes, conveniosRes] = await Promise.all([
      pacienteIds.length > 0 
        ? supabase.from('pacientes').select('id, nome, data_nascimento').in('id', pacienteIds)
        : Promise.resolve({ data: [] }),
      unidadeIds.length > 0 
        ? supabase.from('unidades').select('id, nome').in('id', unidadeIds)
        : Promise.resolve({ data: [] }),
      convenioIds.length > 0 
        ? supabase.from('convenios').select('id, nome').in('id', convenioIds)
        : Promise.resolve({ data: [] })
    ]);

    // Mapear dados para fácil acesso
    const pacientesMap = {};
    const unidadesMap = {};
    const conveniosMap = {};

    pacientesRes.data?.forEach(p => {
      pacientesMap[p.id] = { nome: p.nome, dob: p.data_nascimento };
    });
    unidadesRes.data?.forEach(u => {
      unidadesMap[u.id] = u.nome;
    });
    conveniosRes.data?.forEach(c => {
      conveniosMap[c.id] = c.nome;
    });

    // Formatar resultado final
    const formatted = appointments.map(apt => {
      const paciente = pacientesMap[apt.paciente_id] || {};
      const age = paciente.dob ? calculateAge(paciente.dob) : null;

      // Aplicar filtro de idade em JavaScript (após trazer dados)
      if (minAge !== null && age !== null && age < Number(minAge)) {
        return null;
      }
      if (maxAge !== null && age !== null && age > Number(maxAge)) {
        return null;
      }

      return {
        id: apt.id,
        data_agendamento: apt.data_agendamento,
        horario_inicio: apt.horario_inicio,
        horario_fim: apt.horario_fim,
        modalidade: apt.modalidade,
        status: apt.status,
        paciente_nome: paciente.nome || 'Sem paciente',
        paciente_age: age,
        paciente_id: apt.paciente_id,
        unidade_nome: unidadesMap[apt.unidade_id] || 'Sem unidade',
        unidade_id: apt.unidade_id,
        convenio_nome: conveniosMap[apt.convenio_id] || 'Sem convênio',
        convenio_id: apt.convenio_id,
      };
    }).filter(apt => apt !== null);

    return formatted;
  } catch (error) {
    console.error('Erro ao buscar agendamentos com nomes:', error);
    throw error;
  }
};

// Obter lista de unidades com nomes com cache (dados estáticos)
const getUnitsWithNames = async () => {
  try {
    const now = Date.now();
    
    // Verificar cache
    if (unitsCache && cacheTimestamps.units && (now - cacheTimestamps.units) < CACHE_DURATION) {
      console.log('Unidades carregadas do cache');
      return unitsCache;
    }

    const { data, error } = await supabase
      .from('unidades')
      .select('id, nome')
      .eq('is_active', true)
      .order('nome');

    if (error) throw error;
    
    // Salvar em cache
    unitsCache = data || [];
    cacheTimestamps.units = now;
    
    return unitsCache;
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    // Retornar cache mesmo se expirado, em caso de erro
    return unitsCache || [];
  }
};

// Obter lista de convênios com nomes com cache (dados estáticos)
const getInsurancesWithNames = async () => {
  try {
    const now = Date.now();
    
    // Verificar cache
    if (insuranceCache && cacheTimestamps.insurance && (now - cacheTimestamps.insurance) < CACHE_DURATION) {
      console.log('Convênios carregados do cache');
      return insuranceCache;
    }

    const { data, error } = await supabase
      .from('convenios')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    
    // Salvar em cache
    insuranceCache = data || [];
    cacheTimestamps.insurance = now;
    
    return insuranceCache;
  } catch (error) {
    console.error('Erro ao buscar convênios:', error);
    // Retornar cache mesmo se expirado, em caso de erro
    return insuranceCache || [];
  }
};

// Função para limpar cache (útil para teste ou força refresco manual)
const clearCache = () => {
  unitsCache = null;
  insuranceCache = null;
  cacheTimestamps = { units: null, insurance: null };
};

module.exports = {
  getAppointmentsWithNames,
  getUnitsWithNames,
  getInsurancesWithNames,
  clearCache,
  calculateAge,
};
