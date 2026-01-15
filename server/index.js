const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Asegúrate de haber hecho: npm install nodemailer
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- CONEXIÓN A MONGODB ATLAS ---
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
  nombre: String, 
  email: String, 
  mensaje: String, 
  fecha: { type: Date, default: Date.now }
}));

// --- CONFIGURACIÓN DE CORREO (NODEMAILER) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'drokuas@gmail.com', // Reemplaza con tu Gmail
    pass: 'bjpzfupsjvsiuajz'          // Reemplaza con tu Clave de Aplicación de Google
  }
});

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const auth = (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) { res.status(401).send("No autorizado"); }
};

// --- RUTAS API ---

// Login Admin
app.post('/api/login', (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET);
    return res.json({ token });
  }
  res.status(401).send("Error de acceso");
});

// CRUD Servicios
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

app.put('/api/servicios/:id', auth, async (req, res) => res.json(await Servicio.findByIdAndUpdate(req.params.id, req.body, {new: true})));
app.delete('/api/servicios/:id', auth, async (req, res) => res.json(await Servicio.findByIdAndDelete(req.params.id)));

// CRUD Reseñas
app.get('/api/resenas', async (req, res) => res.json(await Resena.find()));
app.post('/api/resenas', async (req, res) => res.json(await new Resena(req.body).save()));
app.delete('/api/resenas/:id', auth, async (req, res) => res.json(await Resena.findByIdAndDelete(req.params.id)));

// --- RUTA DE CONTACTO (GUARDAR Y ENVIAR EMAIL) ---
app.post('/api/contacto', async (req, res) => {
  try {
    // 1. Guardar en Base de Datos
    const nuevaConsulta = new Contacto(req.body);
    await nuevaConsulta.save();

    // 2. Configurar el Email
    const mailOptions = {
      from: `EMPREWEB <${req.body.email}>`,
      to: 'contacto@empreweb.com', // Tu correo donde quieres recibir las consultas
      subject: `🚀 Nueva consulta de ${req.body.nombre}`,
      text: `Has recibido un mensaje:\n\nNombre: ${req.body.nombre}\nEmail: ${req.body.email}\nMensaje: ${req.body.mensaje}`
    };

    // 3. Enviar Correo
    await transporter.sendMail(mailOptions);

    res.json({ message: "Consulta guardada y correo enviado exitosamente" });
  } catch (error) {
    console.error("Error en formulario:", error);
    res.status(500).json({ error: "Error al procesar la consulta" });
  }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor EMPREWEB corriendo en Puerto ${PORT}`));