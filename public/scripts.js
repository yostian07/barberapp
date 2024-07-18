document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      window.location.href = 'login.html';
    }
  
    const apiUrl = 'https://57418ktj-3000.use2.devtunnels.ms/api/clients/me';
  
    // Obtener información del cliente y citas
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        const clientData = await response.json();
        document.querySelector('h2').innerText = `Bienvenido, ${clientData.name}`;
        
        const nextAppointment = clientData.appointments[0]; // Suponiendo que el primero es el próximo
        if (nextAppointment) {
          document.getElementById('next-appointment-date').innerText = `Fecha: ${nextAppointment.date}`;
          document.getElementById('next-appointment-time').innerText = `Hora: ${nextAppointment.time}`;
          document.getElementById('next-appointment-service').innerText = `Servicio: ${nextAppointment.service}`;
        }
  
        // Poblar historial de citas
        const appointmentHistory = document.getElementById('appointment-history');
        clientData.appointments.forEach(appointment => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${appointment.date}</td>
            <td>${appointment.time}</td>
            <td>${appointment.service}</td>
          `;
          appointmentHistory.appendChild(row);
        });
      } else {
        alert('No se pudo cargar la información del cliente');
      }
    } catch (error) {
      console.error('Error cargando la información del cliente:', error);
      alert('No se pudo cargar la información del cliente: Error de red');
    }
  });
  
  document.getElementById('appointment-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const service = document.getElementById('service').value;
    const token = localStorage.getItem('token');
  
    const apiUrl = 'https://57418ktj-3000.use2.devtunnels.ms/api/appointments';
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date, time, service }),
      });
  
      if (response.ok) {
        alert('Cita agendada con éxito');
        document.getElementById('appointment-form').reset();
        // Opcional: actualizar el historial de citas sin recargar la página
      } else {
        const errorData = await response.json();
        alert(`No se pudo agendar la cita: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error al agendar la cita:', error);
      alert('No se pudo agendar la cita: Error de red');
    }
  });
  