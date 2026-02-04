import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, ArrowUpRight, Sparkles } from 'lucide-react';

const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'smart', label: 'Smart Stay' },
  { id: 'boutique', label: 'Boutique' },
  { id: 'inclusive', label: 'All Inclusive' },
  { id: 'eco', label: 'Eco-Luxury' }
];

const blogPosts = [
  {
    id: 1,
    title: "The Muraka",
    category: "inclusive",
    location: "Maldivas",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "La primera residencia submarina del mundo, sumergida 5 metros bajo el Océano Índico.",
    link: "https://www.conradmaldives.com/stay/the-muraka/",
    size: "large"
  },
  {
    id: 2,
    title: "Burj Al Arab",
    category: "inclusive",
    location: "Dubái, UAE",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "El hotel más lujoso del mundo, con suites dúplex y servicio de mayordomo privado.",
    link: "https://www.jumeirah.com/en/stay/dubai/burj-al-arab-jumeirah",
    size: "medium"
  },
  {
    id: 3,
    title: "Azulik Tulum",
    category: "eco",
    location: "Tulum, México",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Santuario eco-arquitectónico sin luz eléctrica, reconectando con la naturaleza maya.",
    link: "https://www.azulik.com/",
    size: "small"
  },
  {
    id: 4,
    title: "Henn-na Hotel",
    category: "smart",
    location: "Tokio, Japón",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "El primer hotel del mundo atendido por robots, desde la recepción hasta el guardarropa.",
    link: "https://www.hennnahotel.com/",
    size: "medium"
  },
  {
    id: 5,
    title: "Soneva Jani",
    category: "inclusive",
    location: "Maldivas",
    image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Villas sobre el agua con toboganes privados y techos retráctiles para ver las estrellas.",
    link: "https://soneva.com/resorts/soneva-jani/",
    size: "small"
  },
  {
    id: 6,
    title: "Kakslauttanen Arctic",
    category: "eco",
    location: "Laponia, Finlandia",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Iglús de cristal térmico para admirar las auroras boreales desde tu cama.",
    link: "https://www.kakslauttanen.fi/",
    size: "medium"
  },
  {
    id: 7,
    title: "Amangiri",
    category: "boutique",
    location: "Utah, USA",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    description: "Minimalismo brutalista que se funde con los cañones del desierto de Utah.",
    link: "https://www.aman.com/resorts/amangiri",
    size: "large"
  },
  {
    id: 8,
    title: "Icehotel",
    category: "eco",
    location: "Jukkasjärvi, Suecia",
    image: "https://images.unsplash.com/photo-1517840901100-8179e982acb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "El original hotel de hielo y arte, reconstruido cada invierno con diseño único.",
    link: "https://www.icehotel.com/",
    size: "small"
  },
  {
    id: 9,
    title: "Marina Bay Sands",
    category: "smart",
    location: "Singapur",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Icono arquitectónico con la piscina infinita más grande del mundo en la azotea.",
    link: "https://www.marinabaysands.com/",
    size: "medium"
  },
  {
    id: 10,
    title: "Whitepod Eco-Luxury",
    category: "eco",
    location: "Monthey, Suiza",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Pods geodésicos de alta tecnología en los Alpes suizos.",
    link: "https://whitepod.com/",
    size: "medium"
  },
  {
    id: 11,
    title: "Jade Mountain",
    category: "boutique",
    location: "Santa Lucía",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Santuarios abiertos sin cuarta pared, con vistas a los Pitons.",
    link: "https://www.jademountain.com/",
    size: "large"
  },
  {
    id: 12,
    title: "Silversands",
    category: "smart",
    location: "Granada",
    image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7c1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Minimalismo elegante con la piscina más larga del Caribe y control total por app.",
    link: "https://www.silversandsgrenada.com/",
    size: "small"
  },
  {
    id: 13,
    title: "Longitude 131",
    category: "eco",
    location: "Uluru, Australia",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Glamping de lujo con vistas directas al sagrado Uluru.",
    link: "https://longitude131.com.au/",
    size: "medium"
  },
  {
    id: 14,
    title: "The Brando",
    category: "inclusive",
    location: "Tetiaroa, Polinesia",
    image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "El refugio privado de Marlon Brando, ahora un resort 100% sostenible.",
    link: "https://thebrando.com/",
    size: "small"
  },
  {
    id: 15,
    title: "Tierra Patagonia",
    category: "boutique",
    location: "Torres del Paine, Chile",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Arquitectura que se funde con el viento y la estepa patagónica.",
    link: "https://tierrahotels.com/patagonia/",
    size: "medium"
  },
  {
    id: 16,
    title: "Post Ranch Inn",
    category: "boutique",
    location: "Big Sur, USA",
    image: "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Casas en los árboles y suites en acantilados sobre el Pacífico.",
    link: "https://www.postranchinn.com/",
    size: "small"
  }
];

const HotelBlog = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [visiblePosts, setVisiblePosts] = useState(blogPosts);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setVisiblePosts(blogPosts);
    } else {
      setVisiblePosts(blogPosts.filter(post => post.category === activeCategory));
    }
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#000020] font-sans selection:bg-[#000080] selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#000080] rounded-full blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#84cc16] rounded-full blur-[120px] opacity-20"></div>

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <Sparkles className="w-4 h-4 text-[#84cc16]" />
            <span className="text-gray-300 text-xs font-bold tracking-widest uppercase">The Luxury Edit</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight">
            Hoteles del <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#84cc16]">Futuro</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Explora nuestra colección curada de estancias innovadoras. Donde el diseño de vanguardia se encuentra con la hospitalidad de clase mundial.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 backdrop-blur-md border ${
                activeCategory === cat.id
                  ? 'bg-white text-[#000080] border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Bento Grid */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {visiblePosts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative rounded-[2rem] overflow-hidden border border-white/10 cursor-pointer transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,0,128,0.3)] ${
                post.size === 'large' ? 'md:col-span-2 md:row-span-2' : 
                post.size === 'medium' ? 'md:col-span-1 md:row-span-2' : 
                'md:col-span-1 md:row-span-1'
              }`}
            >
              {/* Background Image with Hover Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000020] via-[#000020]/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-60"></div>
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                {/* Top Badge */}
                <div className="absolute top-6 left-6 opacity-0 transform -translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl text-white text-xs font-bold border border-white/20">
                    {categories.find(c => c.id === post.category)?.label}
                  </span>
                </div>

                {/* Arrow Icon */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 transform rotate-45 transition-transform duration-300 group-hover:rotate-0 group-hover:bg-white group-hover:text-[#000080]">
                  <ArrowUpRight className="w-5 h-5 text-white group-hover:text-[#000080]" />
                </div>

                <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                  <div className="flex items-center gap-2 mb-2 text-gray-300 text-sm">
                    <MapPin className="w-4 h-4 text-[#84cc16]" />
                    {post.location}
                  </div>
                  <h3 className={`font-serif font-bold text-white mb-2 leading-tight ${
                    post.size === 'large' ? 'text-4xl' : 'text-2xl'
                  }`}>
                    {post.title}
                  </h3>
                  <p className="text-gray-400 line-clamp-2 text-sm leading-relaxed max-w-md">
                    {post.description}
                  </p>
                </div>
              </div>

              {/* Glassmorphism Glow Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HotelBlog;