import React from 'react';

const partners = [
  { name: 'Decameron', logo: '/logos/logo-decameron.png' },
  { name: 'On Vacation', logo: '/logos/logo-on-vacation.png' },
  { name: 'Hoteles RIU', logo: '/logos/logo-riu.png' },
  { name: 'Avianca', logo: '/logos/logo-avianca.png' },
  { name: 'LATAM', logo: '/logos/logo-latam.png' },
  { name: 'Copa Airlines', logo: '/logos/logo-copa.svg' },
  { name: 'Wingo', logo: '/logos/logo-wingo.png' },
  { name: 'Satena', logo: '/logos/logo-satena.png' },
  { name: 'Clic Air', logo: '/logos/logo-clic-air.png' },
  { name: 'JetSmart', logo: '/logos/logo-jetsmart.png' },
  { name: 'American Airlines', logo: '/logos/logo-american.png' },
  { name: 'Iberia', logo: '/logos/logo-iberia.png' },
  { name: 'Air Europa', logo: '/logos/logo-air-europa.png' },
  { name: 'Emirates', logo: '/logos/logo-emirates.png' },
  { name: 'Qatar Airways', logo: '/logos/logo-qatar.png' },
  { name: 'Delta', logo: '/logos/logo-delta.png' },
  { name: 'Air France', logo: '/logos/logo-air-france.png' },
  { name: 'Lufthansa', logo: '/logos/logo-lufthansa.png' },
  { name: 'Turkish Airlines', logo: '/logos/logo-turkish.png' },
];

const Partners = () => {
    return (
        <section className="py-16 bg-white overflow-hidden relative">
             {/* Gradient Overlay for Fade Effect */}
            <div className="absolute inset-y-0 left-0 w-20 md:w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 md:w-32 bg-gradient-to-l from-white to-transparent z-10"></div>

            <div className="container mx-auto px-4 mb-12 text-center">
                 <p className="text-[#000080] text-sm font-bold tracking-[0.2em] uppercase mb-2">VIAJA CON LOS MEJORES</p>
                 <h2 className="text-3xl font-serif font-bold text-gray-900">Nuestros Proveedores</h2>
            </div>

            <div className="flex w-full overflow-hidden group py-4">
                {/* Infinite Scroll Container - Duplicated for seamless loop */}
                <div className="flex animate-infinite-scroll group-hover:paused gap-8 md:gap-12 items-center flex-shrink-0 pr-8 md:pr-12">
                    {[...partners, ...partners].map((partner, index) => (
                        <div 
                            key={`${partner.name}-${index}`} 
                            className="flex-shrink-0 flex items-center justify-center w-32 h-20 md:w-40 md:h-24 p-4 rounded-xl bg-gray-50 border border-gray-100 grayscale hover:grayscale-0 hover:scale-110 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <img 
                                src={partner.logo} 
                                alt={partner.name} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    ))}
                </div>
                {/* Second Loop for continuity */}
                <div className="flex animate-infinite-scroll group-hover:paused gap-8 md:gap-12 items-center flex-shrink-0 pr-8 md:pr-12" aria-hidden="true">
                    {[...partners, ...partners].map((partner, index) => (
                        <div 
                            key={`${partner.name}-duplicate-${index}`} 
                            className="flex-shrink-0 flex items-center justify-center w-32 h-20 md:w-40 md:h-24 p-4 rounded-xl bg-gray-50 border border-gray-100 grayscale hover:grayscale-0 hover:scale-110 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <img 
                                src={partner.logo} 
                                alt={partner.name} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Partners;