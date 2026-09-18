import express from 'express';
import { Booking } from './models/Booking';
import { getInvoice } from './controllers/bookingController';
import { sequelize } from './config/database';

const app = express();
app.get('/api/invoice/:referenceId', getInvoice);

async function test() {
  await sequelize.sync();
  const b = await Booking.create({
    name: 'Test',
    email: 'test@test.com',
    phone: '123',
    roomType: 'Suite',
    checkIn: new Date(),
    checkOut: new Date(),
    guests: 2
  });
  console.log("Created booking:", b.referenceId);
  
  const server = app.listen(5001, async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/invoice/${b.referenceId}`);
      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Response text start:", text.substring(0, 100));
    } catch(e) {
      console.error(e);
    }
    server.close();
  });
}
test();
