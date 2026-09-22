import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import crypto from 'crypto';

export class Reservation extends Model {
  declare id: number;
  declare referenceId: string;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare date: Date;
  declare time: string;
  declare guests: number;
  declare occasion: string;
  declare specialRequests: string;
  declare status: string; // 'pending', 'confirmed', 'cancelled'
}

Reservation.init(
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    guests: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    occasion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'confirmed',
    },
  },
  {
    sequelize,
    tableName: 'reservations',
    hooks: {
      beforeValidate: (reservation: Reservation) => {
        if (!reservation.referenceId) {
          reservation.referenceId = 'BEL-' + crypto.randomBytes(3).toString('hex').toUpperCase();
        }
      },
    },
  }
);
