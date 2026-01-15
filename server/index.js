const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- CONEXIÓN A MONGODB ---
// Revisa que en Render tengas la variable MONGO_URI
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado exitosamente a MongoDB Atlas"))
  .catch(err => {
      console.log("❌ Error de conexión a MongoDB:", err);
  });

// --- MODELOS DE DATOS ---
const ServicioSchema = new mongoose.Schema({
  titulo: String,
  precio: String,
  desc: String,
  categoria: { 
    type: String, 
    enum: ['web', 'landing', 'adicional', 'principal', 'proyecto'] 
  }, 
  destacado: { type: Boolean, default: false }
});
const Servicio = mongoose.model('Servicio', ServicioSchema);

const ResenaSchema = new mongoose.Schema({
  nombre: String,
  comentario: String,
  estrellas: { type: Number, default: 5 }
});
const Resena = mongoose.model('Resena', ResenaSchema);

const Contacto = mongoose.model('Contacto', new mongoose.Schema({
  nombre: String, email: String, mensaje: String, fecha: { type: Date, default: Date.now }
}));

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const auth = (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    // Usa JWT_SECRET de Render o un fallback por si lo olvidaste
    jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_temporal');
    next();
  } catch (e) { res.status(401).send("No autorizado"); }
};

// --- RUTA DE LOGIN (REPARADA PARA RENDER) ---
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  
  // Compara contra la variable "Value" que pusiste en Render
  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET || 'clave_secreta_temporal');
    return res.json({ token });
  }
  res.status(401).send("Error: Contraseña incorrecta");
});

// --- CRUD SERVICIOS ---
app.get('/api/servicios', async (req, res) => res.json(await Servicio.find()));

app.post('/api/servicios', auth, async (req, res) => {
  try {
    const nuevoServicio = new Servicio(req.body);
    await nuevoServicio.save();
    res.json(nuevoServicio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/servicios/:id', auth, async (req, res) => {
    res.json(await Servicio.findByIdAndUpdate(req.params.id, req.body, {new: true}));
});

app.delete('/api/servicios/:id', auth, async (req, res) => {
    res.json(await Servicio.findByIdAndDelete(req.params.id));
});

// --- CRUD RESEÑAS ---
app.get('/api/resenas', async (req, res) => res.json(await Resena.find()));
app.post('/api/resenas', async (req, res) => res.json(await new Resena(req.body).save())); 
app.delete('/api/resenas/:id', auth, async (req, res) => res.json(await Resena.findByIdAndDelete(req.params.id)));

// --- CONTACTO ---
app.post('/api/contacto', async (req, res) => {
    try {
        const nuevo = new Contacto(req.body);
        await nuevo.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// PUERTO DINÁMICO
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor activo en puerto ${PORT}`));