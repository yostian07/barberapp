const pool = require('../db');

const createAppointment = async (name, date) => {
  const [result] = await pool.query('INSERT INTO appointments (name, date) VALUES (?, ?)', [name, date]);
  return result;
};

module.exports = {
  createAppointment,
};
