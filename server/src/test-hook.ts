import { Sequelize, DataTypes, Model } from 'sequelize';
import crypto from 'crypto';

const sequelize = new Sequelize('sqlite::memory:');

class Booking extends Model {
  declare id: number;
  declare referenceId: string;
}

Booking.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  referenceId: { type: DataTypes.STRING, unique: true, allowNull: false },
}, {
  sequelize,
  hooks: {
    beforeValidate: (booking: Booking) => {
      if (!booking.referenceId) {
        booking.referenceId = 'BEL-' + crypto.randomBytes(3).toString('hex').toUpperCase();
      }
    },
  },
});

async function test() {
  await sequelize.sync();
  const b = await Booking.create({});
  console.log("Created referenceId:", b.referenceId);
  const found = await Booking.findOne({ where: { referenceId: b.referenceId } });
  console.log("Found:", !!found);
}
test().catch(console.error);
