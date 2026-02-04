import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Award, Globe, Shield, Users, Rocket, Heart, Leaf, Zap } from 'lucide-react';

const AnimatedCounter = ({ value, duration = 2 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useSpring(0, { duration: duration * 1000 });
  const rounded = useTransform(count, (latest) => Math.floor(latest));
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (isInView) {
      count.set(value);
    }
  }, [isInView, value, count]);

  React.useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    return unsubscribe;
  }, [rounded]);

  return <span ref={ref}>{displayValue}</span>;
};

const TiltCard = ({ children, className }) => {
  const x = useSpring(0, { stiffness: 150, damping: 20 });
  const y = useSpring(0, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 20); // Tilt amount
    y.set(yPct * -20);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: y, rotateY: x }}
      className={`preserve-3d ${className}`}
    >
      {children}
    </motion.div>
  );
};

const AboutUs = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  const milestones = [
    { year: '2018', title: 'El Origen', desc: 'Nacimos con una idea simple: digitalizar el turismo de lujo.', icon: Rocket },
    { year: '2020', title: 'Resiliencia', desc: 'Innovamos con tours virtuales durante la pandemia global.', icon: Shield },
    { year: '2022', title: 'Expansión', desc: 'Llegamos a 50 destinos internacionales y abrimos sede en Dubái.', icon: Globe },
    { year: '2024', title: 'Sostenibilidad', desc: 'Certificación Carbon Neutral en todas nuestras operaciones.', icon: Leaf },
  ];

  const team = [
    { name: 'Elena Vox', role: 'CEO & Visionary', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Marc Zeon', role: 'CTO', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { name: 'Sarah J.', role: 'Head of Experience', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="min-h-screen bg-[#000020] text-white font-sans overflow-x-hidden selection:bg-[#84cc16] selection:text-[#000020]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: y1 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80" 
            alt="Travel Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#000020]/30 via-[#000020]/60 to-[#000020]"></div>
        </motion.div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-4 px-6 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md"
          >
            <span className="text-[#84cc16] tracking-widest uppercase text-sm font-bold">Est. 2018</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-8xl font-serif font-bold mb-6 tracking-tight"
          >
            Redefiniendo <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#84cc16]">el Viaje</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light"
          >
            Donde la tecnología invisible potencia experiencias humanas inolvidables.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { value: 10000, label: 'Viajeros Felices', prefix: '+' },
            { value: 500, label: 'Destinos Globales', prefix: '+' },
            { value: 100, label: 'Facturación Digital', prefix: '', suffix: '%' },
          ].map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-5xl md:text-6xl font-bold text-white">
                {stat.prefix}<AnimatedCounter value={stat.value} />{stat.suffix}
              </div>
              <p className="text-[#84cc16] font-medium tracking-wide uppercase text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent hidden md:block"></div>
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-center mb-20">Nuestra Trayectoria</h2>
          <div className="space-y-24">
            {milestones.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 text-center md:text-left">
                  <div className={`flex flex-col ${index % 2 === 0 ? 'md:items-start' : 'md:items-end'}`}>
                    <span className="text-6xl font-bold text-white/10 mb-2">{item.year}</span>
                    <h3 className="text-2xl font-bold text-blue-300 mb-2">{item.title}</h3>
                    <p className="text-gray-400 max-w-sm">{item.desc}</p>
                  </div>
                </div>
                
                <div className="relative z-10 w-16 h-16 rounded-full bg-[#000020] border-2 border-[#84cc16] flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.3)]">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us - Bento Grid */}
      <section className="py-20 bg-[#000025]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-center mb-16">Nuestros Pilares</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            <motion.div 
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,0,128,0.4)" }}
              className="md:col-span-2 row-span-1 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-8 border border-white/10 backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Zap className="w-32 h-32 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Tecnología en Reservas</h3>
              <p className="text-gray-300">Algoritmos predictivos que aseguran las mejores tarifas y disponibilidad en tiempo real, sin fricción humana innecesaria.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(132,204,22,0.4)" }}
              className="rounded-3xl bg-gradient-to-br from-[#84cc16]/10 to-white/5 p-8 border border-white/10 backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute bottom-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Leaf className="w-24 h-24 text-[#84cc16]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sostenibilidad</h3>
              <p className="text-sm text-gray-300">Compromiso Carbon Zero en cada milla viajada.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}
              className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-8 border border-white/10 backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Heart className="w-24 h-24 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Soporte 24/7</h3>
              <p className="text-sm text-gray-300">Asistencia humana real, potenciada por IA para respuestas instantáneas.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,0,128,0.4)" }}
              className="md:col-span-2 rounded-3xl bg-gradient-to-br from-blue-900/20 to-white/5 p-8 border border-white/10 backdrop-blur-md relative overflow-hidden group flex flex-col justify-center"
            >
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Luxury" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Experiencias de Lujo</h3>
                <p className="text-gray-300 max-w-md">Acceso exclusivo a eventos, villas privadas y transporte de alta gama.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section - 3D Cards */}
      <section className="py-20 pb-32">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-center mb-16">Mentes Creativas</h2>
          <div className="flex flex-wrap justify-center gap-10">
            {team.map((member, index) => (
              <TiltCard key={index} className="w-full max-w-sm">
                <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl group">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000020] via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-[#84cc16] font-medium">{member.role}</p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;