const schedule = require('node-schedule');
const sendEmail = require('./email');
const { sql, poolPromise } = require('../db');

const scheduleReminder = async (appointmentId, date, time, email) => {
  const reminderDate = new Date(date);
  reminderDate.setHours(time.split(':')[0] - 1); // 1 hora antes de la cita

  schedule.scheduleJob(reminderDate, async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, appointmentId)
        .query('SELECT service FROM appointments WHERE id = @id');

      const appointment = result.recordset[0];
      sendEmail(email, 'Recordatorio de Cita', `Tienes una cita para ${appointment.service} el ${date} a las ${time}.`);
    } catch (error) {
      console.error('Error fetching appointment data:', error);
    }
  });
};

module.exports = scheduleReminder;
