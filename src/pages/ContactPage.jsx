import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Instagram, Send, ChevronDown, ChevronUp, MessageSquare, Clock, Youtube, Linkedin, Twitter } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ContactPage = () => {
  const [formStatus, setFormStatus] = useState('idle');
  const [activeAccordion, setActiveAccordion] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('loading');
    setTimeout(() => {
      setFormStatus('sent');
      // Reset after 3 seconds
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 2000);
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const faqs = [
    {
      question: "¿Cuáles son los métodos de pago aceptados?",
      answer: "Aceptamos todas las tarjetas de crédito (Visa, Mastercard, Amex), transferencias bancarias PSE, y pagos en efectivo a través de nuestros aliados. Para empresas, ofrecemos opciones de facturación a 30 días bajo aprobación."
    },
    {
      question: "¿Cómo funciona la política de cancelación?",
      answer: "Entendemos que los planes cambian. Nuestra política estándar permite cancelaciones gratuitas hasta 48 horas antes del viaje. Para paquetes corporativos y eventos, las condiciones se ajustan según el contrato específico."
    },
    {
      question: "¿Ofrecen seguros de viaje?",
      answer: "Sí, todos nuestros paquetes internacionales incluyen un seguro de asistencia médica básica. También ofrecemos coberturas premium opcionales que protegen contra pérdida de equipaje y cancelaciones de vuelos."
    },
    {
      question: "¿Realizan cotizaciones personalizadas?",
      answer: "Absolutamente. Nuestro equipo de 'Diseñadores de Experiencias' puede crear un itinerario a medida para lunas de miel, viajes familiares o retiros corporativos. Simplemente selecciona 'Cotización' en el formulario."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-[#000020] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Customer Support" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#000020] via-[#000020]/80 to-[#000020]"></div>
        </div>
        
        <div className="relative z-10 container max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-900/50 border border-blue-500/30 text-blue-400 text-sm font-bold tracking-wider mb-6 backdrop-blur-sm">
              SOPORTE PREMIUM
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Estamos aquí para <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">acompañar tu aventura</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
              Atención personalizada 24/7 para viajeros y empresas. Tu tranquilidad es nuestro destino.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content: Contact Info & Form */}
      <section className="py-20 relative z-20 -mt-10">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Left Column: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Cards */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 group">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h3>
                  <p className="text-gray-500 text-sm mb-4">Respuesta inmediata para consultas rápidas.</p>
                  <a href="https://wa.me/573017636478" target="_blank" rel="noopener noreferrer" className="text-green-600 font-bold hover:underline inline-flex items-center gap-2">
                    Chatear ahora <Send className="w-4 h-4" />
                  </a>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 group">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-500 text-sm mb-4">Para propuestas detalladas y corporativas.</p>
                  <a href="mailto:viajes@destinospp.com" className="text-blue-600 font-bold hover:underline">
                    viajes@destinospp.com
                  </a>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 group sm:col-span-2">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Oficina Principal</h3>
                      <p className="text-gray-500 mb-4">Bogotá, Colombia</p>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4" /> Lun-Vie: 8am - 6pm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-8">
                <h4 className="text-gray-900 font-bold mb-6 text-lg">Síguenos en redes</h4>
                <div className="flex flex-wrap gap-4">
                  <a href="#" className="w-12 h-12 bg-[#000080] text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30 hover:scale-110 duration-300">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg shadow-purple-900/30 hover:scale-110 duration-300">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-[#FF0000] text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg shadow-red-900/30 hover:scale-110 duration-300">
                    <Youtube className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-[#0077B5] text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg shadow-blue-900/30 hover:scale-110 duration-300">
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg shadow-gray-900/30 hover:scale-110 duration-300">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg shadow-gray-900/30 hover:scale-110 duration-300">
                    <Twitter className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Smart Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2.5rem] blur opacity-30"></div>
              <div className="relative bg-[#000080] p-10 md:p-12 rounded-[2rem] shadow-2xl border border-blue-800/50">
                <h3 className="text-3xl font-bold text-white mb-2">Envíanos un mensaje</h3>
                <p className="text-blue-200 mb-8">Responderemos en menos de 2 horas.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Nombre Completo</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-white border border-blue-200/20 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Teléfono</label>
                      <input 
                        type="tel" 
                        required
                        className="w-full bg-white border border-blue-200/20 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400"
                        placeholder="+57 300..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Correo Electrónico</label>
                    <input 
                      type="email" 
                      required
                      className="w-full bg-white border border-blue-200/20 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400"
                      placeholder="juan@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Asunto</label>
                    <div className="relative">
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                        <option>Cotización de Viaje</option>
                        <option>Soporte al Cliente</option>
                        <option>Eventos Corporativos</option>
                        <option>PQR</option>
                        <option>Otro</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Mensaje</label>
                    <textarea 
                      required
                      rows="4"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={formStatus === 'loading' || formStatus === 'sent'}
                    className={`w-full font-bold text-lg py-4 rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-2
                      ${formStatus === 'sent' 
                        ? 'bg-green-500 text-white shadow-green-500/30' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/40 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                      }
                    `}
                  >
                    {formStatus === 'loading' ? (
                      <span className="animate-pulse">Enviando...</span>
                    ) : formStatus === 'sent' ? (
                      <span>¡Mensaje Enviado!</span>
                    ) : (
                      <>Enviar Mensaje <Send className="w-5 h-5" /></>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Map Section */}
      <section className="relative h-[500px] w-full overflow-hidden bg-[#000020]">
        {/* Tech Overlays */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#000020] via-transparent to-[#000020]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#000020] via-transparent to-[#000020]"></div>
          
          {/* Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        {/* Title Overlay */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 bg-[#000020]/90 backdrop-blur-sm border border-blue-500/30 px-5 py-2 rounded-full shadow-[0_0_20px_rgba(0,0,255,0.3)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-blue-100 font-mono tracking-widest text-xs font-bold">BOGOTÁ, D.C. • EN VIVO</span>
          </div>
        </div>

        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254508.39280645645!2d-74.08175409999999!3d4.6482837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9bfd2da6cb29%3A0x239d635520a33914!2sBogot%C3%A1!5e0!3m2!1ses!2sco!4v1709668800000!5m2!1ses!2sco" 
          width="100%" 
          height="100%" 
          style={{ border: 0, filter: 'grayscale(100%) invert(92%) hue-rotate(180deg) contrast(85%) brightness(85%)' }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full relative z-10 opacity-80 hover:opacity-100 transition-opacity duration-700"
        ></iframe>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#000080] mb-4">Preguntas Frecuentes</h2>
            <p className="text-gray-500">Todo lo que necesitas saber antes de empezar tu viaje.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="border border-gray-200 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-white transition-colors text-left"
                >
                  <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                  {activeAccordion === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activeAccordion === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed bg-white">
                    {faq.answer}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;