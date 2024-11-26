
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title is required' }
      }
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Author is required' }
      }
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });
  return Book;
};