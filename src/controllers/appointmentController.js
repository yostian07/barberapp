const { sql, poolPromise } = require('../db');
const sendEmail = require('../utils/email');
const scheduleReminder = require('../utils/scheduler');

const WORK_START_HOUR = 9; // 9 AM
const WORK_END_HOUR = 18; // 6 PM

const createAppointment = async (req, res) => {
  const { date, time, service } = req.body;
  const clientId = req.user.id;

  console.log(`Received request to create appointment for client ID ${clientId} on ${date} at ${time} for service ${service}`);

  const appointmentHour = parseInt(time.split(':')[0], 10);
  if (appointmentHour < WORK_START_HOUR || appointmentHour >= WORK_END_HOUR) {
    return res.status(400).json({ error: 'La cita debe estar dentro del horario laboral (9 AM - 6 PM)' });
  }

  try {
    const pool = await poolPromise;
    const existingAppointments = await pool.request()
      .input('date', sql.Date, date)
      .input('time', sql.VarChar, time)
      .query('SELECT * FROM appointments WHERE date = @date AND time = @time');

    console.log(`Existing appointments: ${JSON.stringify(existingAppointments.recordset)}`);

    if (existingAppointments.recordset.length > 0) {
      return res.status(400).json({ error: 'El horario ya está ocupado, por favor elija otro' });
    }

    const result = await pool.request()
      .input('clientId', sql.Int, clientId)
      .input('date', sql.Date, date)
      .input('time', sql.VarChar, time)
      .input('service', sql.VarChar, service)
      .query('INSERT INTO appointments (client_id, date, time, service) OUTPUT INSERTED.id VALUES (@clientId, @date, @time, @service)');

    console.log(`Appointment created with ID: ${result.recordset[0].id}`);

    const appointmentId = result.recordset[0].id;

    // Obtener correo del cliente
    const clientResult = await pool.request()
      .input('id', sql.Int, clientId)
      .query('SELECT email FROM clients WHERE id = @id');
    const clientEmail = clientResult.recordset[0].email;

    // Enviar notificación al barbero
    sendEmail('barber@example.com', 'Nueva Cita Agendada', `Tienes una nueva cita el ${date} a las ${time} para ${service}.`);

    // Programar recordatorio al cliente
    scheduleReminder(appointmentId, date, time, clientEmail);

    res.status(201).json({ message: 'Cita creada con éxito' });
  } catch (error) {
    console.error('Error durante la creación de la cita:', error);
    res.status(500).json({ error: 'No se pudo crear la cita' });
  }
};

module.exports = {
  createAppointment,
};
