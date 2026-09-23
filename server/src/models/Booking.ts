import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import crypto from 'crypto';

export class Booking extends Model {
  declare id: number;
  declare referenceId: string;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare roomType: string;
  declare checkIn: Date;
  declare checkOut: Date;
  declare guests: number;
  declare specialRequests: string;
  declare status: string; // 'pending', 'confirmed', 'cancelled'
  declare paymentId: string;
  declare amountPaid: number;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    referenceId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roomType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    checkIn: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    checkOut: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    guests: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'confirmed',
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amountPaid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'bookings',
    hooks: {
      beforeValidate: (booking: Booking) => {
        if (!booking.referenceId) {
          booking.referenceId = 'BEL-' + crypto.randomBytes(3).toString('hex').toUpperCase();
        }
      },
    },
  }
);
