import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class MenuItem extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
  declare price: number | null;
  declare category: string;
  declare isVeg: boolean;
  declare isBestseller: boolean;
  declare image: string;
}

MenuItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVeg: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBestseller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'menu_items',
  }
);
