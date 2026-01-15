const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
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

// --- CONFIGURACIÓN DE CORREO OPTIMIZADA PARA RENDER ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Usa SSL
  auth: {
    user: 'drokuas@gmail.com', 
    pass: 'bjpz fups jvsi uajz' // Clave de aplicación de 16 letras
  },
  tls: {
    rejectUnauthorized: false // Evita bloqueos de certificados en la nube
  }
});

// Verificar conexión del correo al iniciar
transporter.verify((error, success) => {
  if (error) console.log("❌ Error en configuración de correo:", error);
  else console.log("📧 Servidor de correo listo para enviar");
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

app.post('/api/login', (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET);
    return res.json({ token });
  }
  res.status(401).send("Error de acceso");
});

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

app.get('/api/resenas', async (req, res) => res.json(await Resena.find()));
app.post('/api/resenas', async (req, res) => res.json(await new Resena(req.body).save()));
app.delete('/api/resenas/:id', auth, async (req, res) => res.json(await Resena.findByIdAndDelete(req.params.id)));

// --- RUTA DE CONTACTO CORREGIDA (CON TIEMPO DE ESPERA) ---
app.post('/api/contacto', async (req, res) => {
  console.log("📨 Nueva petición de contacto recibida...");
  try {
    const { nombre, email, mensaje } = req.body;

    // 1. Guardar en Base de Datos
    const nuevaConsulta = new Contacto({ nombre, email, mensaje });
    await nuevaConsulta.save();
    console.log("💾 Consulta guardada en MongoDB");

    // 2. Enviar Email
    const mailOptions = {
      from: `"EMPREWEB" <drokuas@gmail.com>`,
      to: 'drokuas@gmail.com', 
      subject: `🚀 Nueva consulta de ${nombre}`,
      html: `
        <h3>Nueva solicitud de proyecto</h3>
        <p><b>Nombre:</b> ${nombre}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Mensaje:</b> ${mensaje}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado correctamente");

    // 3. Responder al cliente (Frontend)
    res.json({ message: "Consulta guardada y correo enviado exitosamente" });

  } catch (error) {
    console.error("❌ Error en el proceso de contacto:", error);
    res.status(500).json({ error: "Error al procesar la consulta: " + error.message });
  }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor EMPREWEB en puerto ${PORT}`);
});