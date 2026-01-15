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

// --- CONFIGURACIÓN DE CORREO PROTEGIDA (PUERTO 587 PARA NUBE) ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS 
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  },
  pool: true, // Mantiene la conexión abierta para mayor velocidad
  maxConnections: 1,
  connectionTimeout: 10000 // 10 segundos de espera
});

// Verificar conexión del correo al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Error en configuración SMTP (Revisa GMAIL_USER y GMAIL_PASS en Render):", error.message);
  } else {
    console.log("📧 Servidor de correo conectado y listo para enviar");
  }
});

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const auth = (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send("No autorizado");
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) { res.status(401).send("Token inválido"); }
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

app.put('/api/servicios/:id', auth, async (req, res) => {
  try {
    const actualizado = await Servicio.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/servicios/:id', auth, async (req, res) => {
  try {
    await Servicio.findByIdAndDelete(req.params.id);
    res.json({ message: "Eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/resenas', async (req, res) => res.json(await Resena.find()));
app.post('/api/resenas', async (req, res) => res.json(await new Resena(req.body).save()));
app.delete('/api/resenas/:id', auth, async (req, res) => res.json(await Resena.findByIdAndDelete(req.params.id)));

// --- RUTA DE CONTACTO SILENCIOSA ---
app.post('/api/contacto', async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    // Guardar en Base de Datos para respaldo
    const nuevaConsulta = new Contacto({ nombre, email, mensaje });
    await nuevaConsulta.save();

    // Enviar Email
    const mailOptions = {
      from: `"EMPREWEB NOTIFICADOR" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, 
      subject: `🚀 Nueva consulta de proyecto: ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Nueva solicitud de contacto</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensaje:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${mensaje}</div>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
          <p style="font-size: 0.8em; color: #777;">Enviado automáticamente desde EMPREWEB STUDIO</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Consulta enviada exitosamente" });

  } catch (error) {
    console.error("❌ Error en proceso de contacto:", error);
    res.status(500).json({ error: "No se pudo procesar el envío." });
  }
});

// --- PUERTO ADAPTATIVO ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor EMPREWEB activo en puerto ${PORT}`);
});