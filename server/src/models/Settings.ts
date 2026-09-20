import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Settings extends Model {
  declare id: number;
  declare maxGlampingBookingsPerDay: number;
  declare maxTableReservationsPerDay: number;
  declare propertyAddressLine1: string;
  declare propertyAddressLine2: string;
  declare propertyEmail: string;
  declare propertyPhone: string;
}

Settings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    maxGlampingBookingsPerDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    maxTableReservationsPerDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
    },
    propertyAddressLine1: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '123 Mountain View Road',
    },
    propertyAddressLine2: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Hill Station, India 400001',
    },
    propertyEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'contact@cafebelmirah.com',
    },
    propertyPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '+91 98765 43210',
    }
  },
  {
    sequelize,
    tableName: 'Settings',
  }
);
