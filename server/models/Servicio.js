const mongoose = require('mongoose');

const ServicioSchema = new mongoose.Schema({
  titulo: String,
  precio: String,
  desc: String,
  categoria: { type: String, enum: ['servicio', 'trabajo'], default: 'servicio' },
  imagenUrl: String, // Para tus trabajos realizados
});

module.exports = mongoose.model('Servicio', ServicioSchema);