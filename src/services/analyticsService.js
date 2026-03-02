const appointmentService = require('./appointmentService');
const { supabase } = require('../config/supabase');

// Gerar gráfico de agendamentos por especialidade
const getSpecialtyDistribution = async (filters = {}) => {
  try {
    const appointments = await appointmentService.getAppointmentsFiltered(filters);
    
    const distribution = {};
    appointments.forEach(apt => {
      const specialty = apt.modalidade || 'Sem especialidade';
      distribution[specialty] = (distribution[specialty] || 0) + 1;
    });

    return {
      labels: Object.keys(distribution),
      data: Object.values(distribution),
      total: appointments.length,
    };
  } catch (error) {
    console.error('Erro ao gerar distribuição por especialidade:', error);
    throw error;
  }
};

// Gerar gráfico de agendamentos por convênio
const getInsuranceDistribution = async (filters = {}) => {
  try {
    const appointments = await appointmentService.getAppointmentsFiltered(filters);
    
    const distribution = {};
    appointments.forEach(apt => {
      const insuranceId = apt.convenio_id || 'Sem convênio';
      distribution[insuranceId] = (distribution[insuranceId] || 0) + 1;
    });

    // resolve insurance names
    const ids = Object.keys(distribution).filter(id => id !== 'Sem convênio');
    let map = {};
    if (ids.length) {
      const { data: ins } = await supabase
        .from('convenios')
        .select('id, nome')
        .in('id', ids);
      ins?.forEach(i => { map[i.id] = i.nome; });
    }

    const labels = Object.keys(distribution).map(id => map[id] || id);

    return {
      labels,
      data: Object.values(distribution),
      total: appointments.length,
    };
  } catch (error) {
    console.error('Erro ao gerar distribuição por convênio:', error);
    throw error;
  }
};

// Gerar gráfico de agendamentos por unidade
const getUnitDistribution = async (filters = {}) => {
  try {
    const statistics = await appointmentService.getStatisticsByUnit(filters);
    
    const distribution = {};
    Object.keys(statistics).forEach(unitId => {
      distribution[unitId] = statistics[unitId].total;
    });

    // fetch unit names
    const ids = Object.keys(distribution).filter(id => id !== 'Sem unidade');
    let map = {};
    if (ids.length) {
      const { data: units } = await supabase
        .from('unidades')
        .select('id, nome')
        .in('id', ids);
      units?.forEach(u => { map[u.id] = u.nome; });
    }

    const labels = Object.keys(distribution).map(id => map[id] || id);

    return {
      labels,
      data: Object.values(distribution),
      total: Object.values(distribution).reduce((a, b) => a + b, 0),
    };
  } catch (error) {
    console.error('Erro ao gerar distribuição por unidade:', error);
    throw error;
  }
};

// Gerar comparativo detalhado de unidades
const getUnitComparison = async (filters = {}) => {
  try {
    const statistics = await appointmentService.getStatisticsByUnit(filters);
    
    // map unit names
    const ids = Object.keys(statistics).filter(id => id !== 'Sem unidade');
    let nameMap = {};
    if (ids.length) {
      const { data: units } = await supabase
        .from('unidades')
        .select('id, nome')
        .in('id', ids);
      units?.forEach(u => { nameMap[u.id] = u.nome; });
    }

    const comparison = [];
    Object.keys(statistics).forEach(unitId => {
      const stats = statistics[unitId];
      comparison.push({
        unitId: stats.unitId,
        unitName: nameMap[unitId] || stats.unitId,
        total: stats.total,
        agendado: stats.agendado || 0,
        faltou: stats.faltou || 0,
        cancelado: stats.cancelado || 0,
        modalidades: stats.modalidades,
      });
    });

    return {
      units: comparison.sort((a, b) => b.total - a.total),
      totalAppointments: comparison.reduce((sum, u) => sum + u.total, 0),
      averagePerUnit: comparison.length > 0 
        ? (comparison.reduce((sum, u) => sum + u.total, 0) / comparison.length).toFixed(2)
        : 0,
    };
  } catch (error) {
    console.error('Erro ao gerar comparativo de unidades:', error);
    throw error;
  }
};

// Gerar gráfico de agendamentos por faixa etária (menores e maiores de 18 anos)
const dataService = require('./dataService');

const getAgeGroupDistribution = async (filters = {}) => {
  try {
    // usamos a consulta com nomes/idade já calculada
    const appointments = await dataService.getAppointmentsWithNames(filters);
    const distribution = { 'Menores de 18': 0, 'Maiores de 18': 0, 'Sem idade': 0 };

    appointments.forEach(apt => {
      const age = apt.paciente_age;
      if (age === null || age === undefined) {
        distribution['Sem idade']++;
      } else if (age < 18) {
        distribution['Menores de 18']++;
      } else {
        distribution['Maiores de 18']++;
      }
    });

    const labels = Object.keys(distribution);
    const data = Object.values(distribution);

    return {
      labels,
      data,
      total: appointments.length,
    };
  } catch (error) {
    console.error('Erro ao gerar distribuição por faixa etária:', error);
    throw error;
  }
};

// Gerar gráfico de agendamentos por especialidade comparando períodos
const getSpecialtyComparison = async (specialty, period1 = 'day', period2 = 'week') => {
  try {
    const apt1 = await appointmentService.getAppointmentsByPeriod(period1);
    const apt2 = await appointmentService.getAppointmentsByPeriod(period2);

    const count1 = apt1.filter(apt => apt.modalidade === specialty).length;
    const count2 = apt2.filter(apt => apt.modalidade === specialty).length;

    return {
      specialty,
      periods: [period1, period2],
      data: [count1, count2],
    };
  } catch (error) {
    console.error('Erro ao gerar comparação de especialidades:', error);
    throw error;
  }
};

// Obter resumo analítico geral
const getAnalyticsDashboard = async (filters = {}) => {
  try {
    const appointments = await appointmentService.getAppointmentsFiltered(filters);
    
    const specialtyDistribution = await getSpecialtyDistribution(filters);
    const insuranceDistribution = await getInsuranceDistribution(filters);
    const unitDistribution = await getUnitDistribution(filters);
    const ageDistribution = await getAgeGroupDistribution(filters);

    const totalAppointments = appointments.length;
    const averageAppointmentsPerDay = totalAppointments / 30; // Aproximação

    return {
      summary: {
        totalAppointments,
        averageAppointmentsPerDay: averageAppointmentsPerDay.toFixed(2),
        period: filters.period || 'day',
      },
      specialtyDistribution,
      insuranceDistribution,
      unitDistribution,
      ageDistribution,
    };
  } catch (error) {
    console.error('Erro ao gerar dashboard de análitica:', error);
    throw error;
  }
};

module.exports = {
  getSpecialtyDistribution,
  getInsuranceDistribution,
  getUnitDistribution,
  getUnitComparison,
  getAgeGroupDistribution,
  getSpecialtyComparison,
  getAnalyticsDashboard,
};
