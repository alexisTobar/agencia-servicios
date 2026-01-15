const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB con mensaje de confirmación
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado exitosamente a MongoDB Atlas"))
  .catch(err => {
      console.log("❌ Error de conexión a MongoDB:", err);
      console.log("Tip: Revisa que tu IP esté autorizada en Network Access en el panel de MongoDB Atlas (usar 0.0.0.0/0 para Render).");
  });

// Modelo para Servicios (Web, Landing, ADICIONAL, PRINCIPAL y PROYECTO)
const ServicioSchema = new mongoose.Schema({
  titulo: String,
  precio: String,
  desc: String, // Separado por comas
  // ACTUALIZADO: Agregamos 'principal' y 'proyecto' para que el servidor los acepte
  categoria: { 
    type: String, 
    enum: ['web', 'landing', 'adicional', 'principal', 'proyecto'] 
  }, 
  destacado: { type: Boolean, default: false }
});
const Servicio = mongoose.model('Servicio', ServicioSchema);

// Modelo para Reseñas
const ResenaSchema = new mongoose.Schema({
  nombre: String,
  comentario: String,
  estrellas: { type: Number, default: 5 }
});
const Resena = mongoose.model('Resena', ResenaSchema);

// Modelo Contacto
const Contacto = mongoose.model('Contacto', new mongoose.Schema({
  nombre: String, email: String, mensaje: String, fecha: { type: Date, default: Date.now }
}));

// Middleware Auth
const auth = (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) { res.status(401).send("No autorizado"); }
};

// Rutas
app.post('/api/login', (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET);
    return res.json({ token });
  }
  res.status(401).send("Error");
});

// CRUD Servicios (Protegidos menos el GET)
app.get('/api/servicios', async (req, res) => res.json(await Servicio.find()));

app.post('/api/servicios', auth, async (req, res) => {
  try {
    const nuevoServicio = new Servicio(req.body);
    await nuevoServicio.save();
    res.json(nuevoServicio);
  } catch (error) {
    console.error("❌ Error al guardar servicio:", error);
    res.status(500).json({ error: error.message });
  }
});

// Agregado {new: true} para que devuelva el dato actualizado al frontend
app.put('/api/servicios/:id', auth, async (req, res) => res.json(await Servicio.findByIdAndUpdate(req.params.id, req.body, {new: true})));
app.delete('/api/servicios/:id', auth, async (req, res) => res.json(await Servicio.findByIdAndDelete(req.params.id)));

// CRUD Reseñas (POST público para que clientes opinen)
app.get('/api/resenas', async (req, res) => res.json(await Resena.find()));
app.post('/api/resenas', async (req, res) => res.json(await new Resena(req.body).save())); // RUTA PÚBLICA
app.delete('/api/resenas/:id', auth, async (req, res) => res.json(await Resena.findByIdAndDelete(req.params.id)));

app.post('/api/contacto', async (req, res) => res.json(await new Contacto(req.body).save()));

// MODIFICACIÓN CLAVE PARA RENDER: Usar el puerto de la variable de entorno
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor EMPREWEB corriendo en Puerto ${PORT}`));