const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../db');

const registerClient = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;
    await pool.request()
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .input('phone', sql.VarChar, phone)
      .query('INSERT INTO clients (name, email, password, phone) VALUES (@name, @email, @password, @phone)');
    res.status(201).json({ message: 'Client registered successfully' });
  } catch (error) {
    console.error('Error during client registration:', error); // Log the error
    res.status(500).json({ error: 'Failed to register client' });
  }
};

const loginClient = async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM clients WHERE email = @email');
    const client = result.recordset[0];
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const match = await bcrypt.compare(password, client.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ id: client.id, email: client.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (error) {
    console.error('Error during client login:', error); // Log the error
    res.status(500).json({ error: 'Failed to login client' });
  }
};

const getClientData = async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, req.user.id)
        .query(`
          SELECT id, name, email, phone
          FROM clients
          WHERE id = @id
        `);
  
      const client = result.recordset[0];
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
  
      const appointmentsResult = await pool.request()
        .input('clientId', sql.Int, client.id)
        .query(`
          SELECT CONVERT(VARCHAR, date, 103) AS date, CONVERT(VARCHAR, time, 108) AS time, service
          FROM appointments
          WHERE client_id = @clientId
          ORDER BY date ASC, time ASC
        `);
  
      client.appointments = appointmentsResult.recordset;
  
      res.json(client);
    } catch (error) {
      console.error('Error fetching client data:', error);
      res.status(500).json({ error: 'Failed to fetch client data' });
    }
  };
  
  module.exports = {
    registerClient,
    loginClient,
    getClientData,
  };
