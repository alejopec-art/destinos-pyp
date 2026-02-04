import React from 'react';

const partners = [
  { name: 'Avianca', logo: 'https://logo.clearbit.com/avianca.com' },
  { name: 'LATAM', logo: 'https://logo.clearbit.com/latamairlines.com' },
  { name: 'Copa Airlines', logo: 'https://logo.clearbit.com/copaair.com' },
  { name: 'Wingo', logo: 'https://logo.clearbit.com/wingo.com' },
  { name: 'Satena', logo: 'https://logo.clearbit.com/satena.com' },
  { name: 'Clic Air', logo: 'https://logo.clearbit.com/clicair.co' },
  { name: 'JetSmart', logo: 'https://logo.clearbit.com/jetsmart.com' },
  { name: 'American Airlines', logo: 'https://logo.clearbit.com/aa.com' },
  { name: 'Iberia', logo: 'https://logo.clearbit.com/iberia.com' },
  { name: 'Air Europa', logo: 'https://logo.clearbit.com/aireuropa.com' },
  { name: 'Emirates', logo: 'https://logo.clearbit.com/emirates.com' },
  { name: 'Qatar Airways', logo: 'https://logo.clearbit.com/qatarairways.com' },
  { name: 'Delta', logo: 'https://logo.clearbit.com/delta.com' },
  { name: 'Air France', logo: 'https://logo.clearbit.com/airfrance.com' },
  { name: 'Lufthansa', logo: 'https://logo.clearbit.com/lufthansa.com' },
  { name: 'Turkish Airlines', logo: 'https://logo.clearbit.com/turkishairlines.com' },
];

const Partners = () => {
    return (
        <section className="py-16 bg-white overflow-hidden relative">
             {/* Gradient Overlay for Fade Effect */}
            <div className="absolute inset-y-0 left-0 w-20 md:w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 md:w-32 bg-gradient-to-l from-white to-transparent z-10"></div>

            <div className="container mx-auto px-4 mb-12 text-center">
                 <p className="text-[#000080] text-sm font-bold tracking-[0.2em] uppercase mb-2">Vuela con los mejores</p>
                 <h2 className="text-3xl font-serif font-bold text-gray-900">Nuestras Aerolíneas Aliadas</h2>
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