import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Marquee from "react-fast-marquee";
import {
  Settings, X, Save, LogIn, Plus, Trash2,
  CheckCircle2, Send, MessageCircle, Mail, MapPin, Star,
  Sun, Moon, Quote, Image as ImageIcon, Rocket, ShieldCheck, Zap, LogOut, Menu,
  Layers, Globe, Palette, Megaphone, Target, User, Laptop, Terminal
} from 'lucide-react';

const API_URL = "https://agencia-servicios.onrender.com/api";

// --- FONDO PARALLAX PROFESIONAL ---
const Background = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 5000], [0, -500]);
  const y2 = useTransform(scrollY, [0, 5000], [0, 500]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-[#020617] transition-colors duration-700 text-left">
      <motion.div style={{ y: y1 }} className="absolute -top-[10%] -left-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-indigo-500/20 blur-[80px] md:blur-[120px]" />
      <motion.div style={{ y: y2 }} className="absolute top-[40%] -right-[10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] rounded-full bg-rose-500/10 blur-[80px] md:blur-[120px]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.1]" />
    </div>
  );
};

export default function App() {
  const [items, setItems] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showResenaForm, setShowResenaForm] = useState(false);
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const palabras = ["marca", "tienda", "negocio", "empresa"];
  const [indexPalabra, setIndexPalabra] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndexPalabra((prev) => (prev + 1) % palabras.length);
    }, 2500);
    return () => clearInterval(intervalo);
  }, []);

  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [nuevaResena, setNuevaResena] = useState({ nombre: '', comentario: '', estrellas: 5 });

  useEffect(() => {
    cargarTodo();
    if (localStorage.getItem('adminToken')) setIsLogged(true);
  }, []);

  const cargarTodo = async () => {
    try {
      const [s, r] = await Promise.all([
        axios.get(`${API_URL}/servicios`),
        axios.get(`${API_URL}/resenas`)
      ]);
      setItems(s.data);
      setResenas(r.data);
    } catch (e) { toast.error("Error al cargar datos"); }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, { password });
      localStorage.setItem('adminToken', res.data.token);
      setIsLogged(true); setShowLogin(false); setPassword('');
      toast.success("Bienvenido Alexis.");
    } catch (e) { toast.error("Contraseña incorrecta"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLogged(false); setIsAdminMode(false);
    toast.info("Sesión cerrada");
  };

  const addItem = async (categoria) => {
    const nuevo = { titulo: "Nuevo Item", precio: "$0", desc: "Descripción...", categoria };
    const token = localStorage.getItem('adminToken');
    await axios.post(`${API_URL}/servicios`, nuevo, { headers: { Authorization: token } });
    cargarTodo();
  };

  const submitResena = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/resenas`, nuevaResena);
      toast.success("¡Reseña publicada!");
      setNuevaResena({ nombre: '', comentario: '', estrellas: 5 });
      setShowResenaForm(false);
      cargarTodo();
    } catch (e) { toast.error("Error al publicar"); }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/contacto`, form);
      const numero = "56977922875";
      const texto = `🚀 *NUEVA CONSULTA EMPREWEB*\n\n*Nombre:* ${form.nombre}\n*Email:* ${form.email}\n*Proyecto:* ${form.mensaje}`;
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank');
      setForm({ nombre: '', email: '', mensaje: '' });
      toast.success("Abriendo WhatsApp...");
    } catch (e) { toast.error("Error al enviar"); }
  };

  const updateItem = async (id, data) => {
    const token = localStorage.getItem('adminToken');
    await axios.put(`${API_URL}/servicios/${id}`, data, { headers: { Authorization: token } });
    cargarTodo();
  };

  const guardarCambios = async (id) => {
    const item = items.find(s => s._id === id);
    const token = localStorage.getItem('adminToken');
    await axios.put(`${API_URL}/servicios/${id}`, item, { headers: { Authorization: token } });
    toast.success("Guardado");
  };

  const deleteItem = async (id, route) => {
    if (!window.confirm("¿Eliminar definitivamente?")) return;
    const token = localStorage.getItem('adminToken');
    await axios.delete(`${API_URL}/${route}/${id}`, { headers: { Authorization: token } });
    cargarTodo();
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} text-left`}>
      <div className="min-h-screen text-slate-900 dark:text-white transition-colors duration-500 antialiased relative">
        <Toaster position="bottom-right" richColors />
        <Background />

        <nav className="fixed top-0 w-full z-[80] bg-white/10 dark:bg-black/20 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-left">
            <h1 className="text-xl md:text-2xl font-black italic uppercase">
              <Rocket className="inline mr-2 text-indigo-500" /> EMPREWEB
            </h1>
            <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-widest text-left">
              <a href="#servicios-principales">Servicios</a>
              <a href="#web">Web</a>
              <a href="#landing">Landings</a>
              <a href="#resenas">Clientes</a>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-white/10 rounded-full border border-white/10 shadow-lg">
                {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
              </button>
              {isLogged && (
                <div className="flex gap-2 bg-black/20 p-1 rounded-full border border-white/10">
                  <button onClick={() => setIsAdminMode(!isAdminMode)} className={`p-2 rounded-full ${isAdminMode ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}><Settings size={18} /></button>
                  <button onClick={handleLogout} className="p-2 text-rose-500"><LogOut size={18} /></button>
                </div>
              )}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden"><Menu /></button>
            </div>
          </div>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-[#020617] border-b border-white/10 overflow-hidden">
                <div className="flex flex-col p-6 gap-6 text-xs font-black uppercase tracking-[0.2em]">
                  <a href="#inicio" onClick={() => setIsMenuOpen(false)}>Inicio</a>
                  <a href="#servicios-principales" onClick={() => setIsMenuOpen(false)}>Servicios</a>
                  <a href="#web" onClick={() => setIsMenuOpen(false)}>Web</a>
                  <a href="#landing" onClick={() => setIsMenuOpen(false)}>Landings</a>
                  <a href="#resenas" onClick={() => setIsMenuOpen(false)}>Clientes</a>
                  <a href="#contacto" onClick={() => setIsMenuOpen(false)} className="text-rose-500 font-bold">Cotizar ahora</a>
                  {isLogged && <button onClick={handleLogout} className="text-rose-500 flex items-center gap-2"><LogOut size={16} /> Salir</button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* --- HERO SECTION REESTRUCTURADO --- */}
        <header id="inicio" className="pt-32 md:pt-44 pb-20 md:pb-32 px-4 md:px-6 max-w-7xl mx-auto overflow-visible">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center text-left">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="z-10">
              <span className="bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase mb-4 inline-block tracking-tighter text-left">Ingeniería Digital 2026</span>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[1] mb-6 md:mb-8 text-left">
                Tu <span className="relative inline-block text-indigo-500 min-w-[100px] md:min-w-[300px]">
                  <AnimatePresence mode="wait">
                    <motion.span key={palabras[indexPalabra]} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="inline-block font-black italic">
                      {palabras[indexPalabra]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <br /> al <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-rose-500">Siguiente Nivel.</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl text-base md:text-xl mb-8 md:mb-10 leading-relaxed text-left">
                En **EMPREWEB** construimos la presencia digital que tu negocio merece. Rapidez superior, diseño Pro y ventas garantizadas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 text-left">
                <a href="#contacto" className="text-center bg-indigo-600 text-white px-8 py-4 rounded-2xl md:rounded-3xl font-black uppercase text-xs shadow-xl hover:bg-indigo-700 transition-all">Solicitar Info</a>
                <a href="#web" className="text-center bg-white/10 border border-white/10 px-8 py-4 rounded-2xl md:rounded-3xl font-black uppercase text-xs transition-all text-center">Ver Planes</a>
              </div>
            </motion.div>

            {/* IMAGEN DE PRESENTACIÓN MAXIMIZADA Y SIN RECUADRO */}
            <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] md:blur-[120px] -z-10 rounded-full" />
              <motion.div 
                animate={{ y: [0, -30, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-[500px] lg:max-w-[120%] flex justify-center lg:justify-end"
              >
                <img 
                  src="https://i.postimg.cc/DwGDHxxH/Copilot-20260115-120913.png" 
                  alt="Empreweb Presentación" 
                  className="w-full h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.4)] scale-110 md:scale-125 lg:scale-150" 
                />
              </motion.div>
            </div>
          </div>
        </header>

        <Marquee className="bg-indigo-600 dark:bg-indigo-900 text-white py-4 md:py-6 font-black uppercase italic border-y border-white/10" speed={50}>
           ALTA VELOCIDAD • DISEÑO PROFESIONAL • OPTIMIZACIÓN SEO • EMPREWEB STUDIO • TALAGANTE CHILE •
        </Marquee>

        {/* --- SERVICIOS PRINCIPALES --- */}
        <section id="servicios-principales" className="py-24 px-6 max-w-7xl mx-auto text-left">
          <div className="text-center mb-20 md:mb-24">
            <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Mis Servicios <span className="text-rose-500 underline decoration-indigo-500 underline-offset-8">Principales</span></h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center text-left">
            {items.filter(i => i.categoria === 'principal').map((item) => (
              <div key={item._id} className="relative group flex flex-col items-center">
                 {isAdminMode && <button onClick={() => deleteItem(item._id, 'servicios')} className="absolute -top-4 text-rose-500 hover:scale-110 transition-all"><Trash2 size={16}/></button>}
                <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[2.5rem] flex items-center justify-center mb-8 border border-rose-500/10 shadow-2xl group-hover:bg-rose-500 group-hover:text-white transition-all">
                  {item.titulo.toLowerCase().includes('web') ? <Globe size={40} /> :
                   item.titulo.toLowerCase().includes('marketing') ? <Target size={40} /> :
                   item.titulo.toLowerCase().includes('grafico') ? <Palette size={40} /> :
                   item.titulo.toLowerCase().includes('publicidad') ? <Megaphone size={40} /> : <Zap size={40} />}
                </div>
                {isAdminMode ? (
                  <div className="space-y-2 w-full">
                    <input className="bg-black/10 dark:bg-white/5 p-2 rounded-xl text-center font-bold" value={item.titulo} onChange={e => updateItem(item._id, {...item, titulo: e.target.value})} />
                    <textarea className="bg-black/10 dark:bg-white/5 p-2 rounded-xl text-center text-xs h-20" value={item.desc} onChange={e => updateItem(item._id, {...item, desc: e.target.value})} />
                    <button onClick={() => guardarCambios(item._id)} className="bg-green-600 text-white px-4 py-1 rounded text-[10px] font-bold">SAVE</button>
                  </div>
                ) : (
                  <>
                    <h4 className="text-xl font-black uppercase italic mb-4">{item.titulo}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm px-4 leading-relaxed font-medium">{item.desc}</p>
                  </>
                )}
              </div>
            ))}
            {isAdminMode && <button onClick={() => addItem('principal')} className="border-4 border-dashed rounded-[3rem] p-12 text-slate-300 hover:text-indigo-500 transition-all"><Plus size={48}/></button>}
          </div>
        </section>

        {/* --- SECCIÓN WEB CORPORATIVA --- */}
        <section id="web" className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto text-left">
          <div className="flex justify-between items-end mb-12 border-b border-indigo-500/20 pb-4">
            <div>
              <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Webs <span className="text-indigo-500">Corporativas</span></h3>
              <p className="text-slate-400 font-bold uppercase text-[8px] md:text-[10px] tracking-widest mt-2">Plataformas de alta gama</p>
            </div>
            {isAdminMode && <button onClick={() => addItem('web')} className="bg-indigo-500 p-2 rounded-full text-white shadow-xl"><Plus size={20}/></button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.filter(i => i.categoria === 'web').map((item) => (
              <PriceCard key={item._id} item={item} isAdmin={isAdminMode} onUpdate={updateItem} onDelete={() => deleteItem(item._id, 'servicios')} />
            ))}
          </div>
        </section>

        {/* --- SECCIÓN LANDING PAGES --- */}
        <section id="landing" className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto bg-slate-900/5 dark:bg-white/5 rounded-[3rem] md:rounded-[5rem] mb-20 md:mb-32 text-left">
          <div className="flex justify-between items-end mb-12 border-b border-rose-500/20 pb-4 px-4 text-left">
            <div>
              <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-rose-500">Landing Pages</h3>
              <p className="text-slate-400 font-bold uppercase text-[8px] md:text-[10px] tracking-widest mt-2">Optimización de conversión</p>
            </div>
            {isAdminMode && <button onClick={() => addItem('landing')} className="bg-rose-500 p-2 rounded-full text-white shadow-xl"><Plus size={20}/></button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {items.filter(i => i.categoria === 'landing').map((item) => (
              <PriceCard key={item._id} item={item} isAdmin={isAdminMode} onUpdate={updateItem} onDelete={() => deleteItem(item._id, 'servicios')} color="rose" />
            ))}
          </div>
        </section>

        {/* --- SECCIÓN ADICIONALES --- */}
        <section id="adicional" className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto text-left">
          <div className="flex justify-between items-end mb-12 border-b border-orange-500/20 pb-8 text-left">
            <div>
              <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-orange-500">Servicios <span className="dark:text-white text-slate-900 font-black">Adicionales</span></h3>
              <p className="text-slate-400 font-bold uppercase text-[8px] md:text-[10px] tracking-widest mt-2">Potencia tu ecosistema</p>
            </div>
            {isAdminMode && <button onClick={() => addItem('adicional')} className="bg-orange-500 p-3 rounded-full text-white shadow-xl"><Plus size={20}/></button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.filter(i => i.categoria === 'adicional').map((item) => (
              <PriceCard key={item._id} item={item} isAdmin={isAdminMode} onUpdate={updateItem} onDelete={() => deleteItem(item._id, 'servicios')} color="orange" />
            ))}
          </div>
        </section>

        {/* --- RESEÑAS --- */}
        <section id="resenas" className="py-32 px-6 max-w-7xl mx-auto text-left">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
            <h3 className="text-3xl md:text-5xl font-black uppercase italic">Casos de <span className="text-indigo-500">Éxito</span></h3>
            <button onClick={() => setShowResenaForm(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all hover:bg-indigo-700">Dejar mi reseña</button>
          </div>
          <Marquee speed={35} pauseOnHover gradient={false}>
            {resenas.map((r) => (
              <div key={r._id} className="mx-4 p-8 bg-white dark:bg-white/5 border border-white/10 rounded-[3rem] w-[320px] md:w-[450px] relative shadow-2xl">
                {isAdminMode && <button onClick={() => deleteItem(r._id, 'resenas')} className="absolute top-6 right-6 text-rose-500 hover:scale-125 transition-all"><Trash2 size={20}/></button>}
                <div className="flex gap-1 mb-4 text-yellow-500">
                  {[...Array(5)].map((_, i) => (<Star key={i} size={18} fill={i < r.estrellas ? "currentColor" : "none"} className={i < r.estrellas ? "" : "text-slate-300 dark:text-slate-700"} />))}
                </div>
                <p className="text-slate-500 dark:text-slate-300 italic text-base md:text-xl mb-8 leading-relaxed font-medium">"{r.comentario}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center font-black text-white">{r.nombre.charAt(0)}</div>
                  <span className="font-black text-xs uppercase tracking-widest">{r.nombre}</span>
                </div>
              </div>
            ))}
          </Marquee>

          <AnimatePresence>
            {showResenaForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[3.5rem] w-full max-w-lg relative border border-white/10 shadow-2xl">
                  <button onClick={() => setShowResenaForm(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-all"><X /></button>
                  <h4 className="text-2xl font-black mb-6 italic uppercase text-indigo-500">Nueva Reseña</h4>
                  <form onSubmit={submitResena} className="space-y-4">
                    <input className="bg-slate-100 dark:bg-white/5 w-full p-4 rounded-2xl outline-none font-bold text-sm text-slate-900 dark:text-white" placeholder="Tu Nombre" required value={nuevaResena.nombre} onChange={e => setNuevaResena({ ...nuevaResena, nombre: e.target.value })} />
                    <textarea className="bg-slate-100 dark:bg-white/5 w-full p-4 rounded-2xl outline-none font-bold text-sm h-32 resize-none text-slate-900 dark:text-white" placeholder="Tu experiencia..." required value={nuevaResena.comentario} onChange={e => setNuevaResena({ ...nuevaResena, comentario: e.target.value })} />
                    <div className="flex flex-col items-center py-2 text-yellow-500">
                      <div className="flex gap-2 text-left">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} type="button" onClick={() => setNuevaResena({ ...nuevaResena, estrellas: s })}>
                            <Star size={28} fill={s <= nuevaResena.estrellas ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-white uppercase text-xs">Publicar</button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* --- CONTACTO WHATSAPP --- */}
        <section id="contacto" className="py-20 md:py-32 px-4 md:px-6 text-left">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 bg-white dark:bg-white/5 rounded-[4rem] md:rounded-[5rem] border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden text-left">
            <div className="p-8 md:p-16 lg:p-20 bg-indigo-600 text-white flex flex-col justify-center">
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 italic uppercase leading-none">Hablemos hoy.</h3>
              <p className="text-indigo-100 mb-8 md:mb-10 text-sm md:text-base font-medium">Lleva tu marca al siguiente nivel. Respondemos vía WhatsApp.</p>
              <div className="space-y-4 font-bold text-[10px] md:text-sm tracking-widest text-left">
                <div className="flex gap-4 items-center"><Mail size={18} /> contacto@empreweb.com</div>
                <div className="flex gap-4 items-center"><MapPin size={18} /> Talagante, Chile</div>
              </div>
            </div>
            <div className="p-8 md:p-16 lg:p-20 text-left">
              <form className="grid gap-4 md:gap-6 text-left" onSubmit={enviarMensaje}>
                <input className="bg-slate-100 dark:bg-black/40 p-4 md:p-6 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white" placeholder="NOMBRE COMPLETO" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                <input className="bg-slate-100 dark:bg-black/40 p-4 md:p-6 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white" placeholder="EMAIL" required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <textarea className="bg-slate-100 dark:bg-black/40 p-4 md:p-6 rounded-2xl outline-none font-bold text-xs h-32 md:h-40 resize-none text-slate-900 dark:text-white" placeholder="DETALLES DEL PROYECTO" required value={form.mensaje} onChange={e => setForm({...form, mensaje: e.target.value})} />
                <button type="submit" className="bg-indigo-600 py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-white uppercase text-[10px] tracking-widest shadow-xl transition-all hover:bg-rose-600">Solicitar Propuesta <Send size={14} className="inline ml-2"/></button>
              </form>
            </div>
          </div>
        </section>

        <footer className="py-10 md:py-20 text-center opacity-30 text-[8px] font-black uppercase tracking-[0.5em] md:tracking-[1em]">© 2026 EMPREWEB CHILE</footer>
        {!isLogged && <div onClick={() => setShowLogin(true)} className="fixed bottom-0 left-0 w-24 h-24 cursor-default z-[100] opacity-0 text-left text-left" title="Admin Login" />}
        <AnimatePresence>
          {showLogin && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[3rem] w-full max-w-sm text-center border border-white/10 shadow-2xl">
                <Terminal size={40} className="mx-auto mb-6 text-indigo-500" />
                <h4 className="text-xl md:text-2xl font-black mb-6 italic uppercase text-indigo-500 text-center">Acceso Maestro</h4>
                <input type="password" autoFocus className="bg-slate-100 dark:bg-white/5 w-full p-5 rounded-xl md:rounded-2xl mb-4 text-center font-black text-xl md:text-2xl text-slate-900 dark:text-white outline-none border-2 border-indigo-500/20" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                <button onClick={handleLogin} className="w-full bg-indigo-600 py-4 rounded-xl font-black text-white uppercase tracking-widest text-xs transition-all hover:bg-indigo-700">Desbloquear</button>
                <button onClick={() => setShowLogin(false)} className="mt-4 text-xs font-bold text-slate-400 uppercase text-left">Cerrar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const PriceCard = ({ item, isAdmin, onUpdate, onDelete, color = "indigo" }) => {
  const [edit, setEdit] = useState(item);
  const themeColors = { rose: "border-rose-500 text-rose-500", indigo: "border-indigo-500 text-indigo-500", orange: "border-orange-500 text-orange-500" };
  const currentTheme = themeColors[color] || themeColors.indigo;

  return (
    <motion.div whileHover={{ y: -8 }} className={`bg-white/40 dark:bg-white/5 backdrop-blur-lg border border-slate-200 dark:border-white/10 p-8 md:p-12 rounded-[3.5rem] md:rounded-[4.5rem] flex flex-col h-full border-b-[12px] md:border-b-[16px] ${currentTheme} transition-all shadow-2xl text-left`}>
      {isAdmin ? (
        <div className="space-y-4">
          <input className="w-full bg-black/20 p-3 rounded-2xl text-xs text-white outline-none border border-white/5 focus:border-indigo-500 text-left" value={edit.titulo} onChange={e => setEdit({ ...edit, titulo: e.target.value })} />
          <input className="w-full bg-black/20 p-3 rounded-2xl text-xs font-black text-indigo-500 outline-none border border-white/5 focus:border-indigo-500 text-left" value={edit.precio} onChange={e => setEdit({ ...edit, precio: e.target.value })} />
          <textarea className="w-full bg-black/20 p-3 rounded-2xl text-xs h-24 text-white outline-none border border-white/5 focus:border-indigo-500 text-left" value={edit.desc} onChange={e => setEdit({ ...edit, desc: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={() => onUpdate(item._id, edit)} className="flex-1 bg-green-600 text-white py-3 rounded-2xl text-[10px] font-bold uppercase transition-all hover:bg-green-700 text-left text-center">Guardar</button>
            <button onClick={onDelete} className="bg-rose-600 text-white px-4 rounded-2xl transition-all hover:bg-rose-700 text-left text-left text-left"><Trash2 size={16}/></button>
          </div>
        </div>
      ) : (
        <>
          <h4 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 leading-none text-left">{item.titulo}</h4>
          <div className={`text-2xl md:text-3xl font-black mb-10 italic text-left`}>{item.precio}</div>
          <ul className="space-y-4 md:space-y-5 mb-10 md:mb-14 flex-grow text-left">
            {item.desc.split(',').map((p, i) => (
              <li key={i} className="flex gap-4 text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400">
                <CheckCircle2 size={18} className="text-indigo-500 shrink-0" /> {p.trim()}
              </li>
            ))}
          </ul>
          <button onClick={() => window.open(`https://wa.me/56977922875?text=Hola Alexis, cotización plan: ${item.titulo}`, '_blank')} className="w-full py-5 md:py-6 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all text-center shadow-xl">Cotizar</button>
        </>
      )}
    </motion.div>
  );
};