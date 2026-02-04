import React from 'react';

const partners = [
  { name: 'Avianca', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Avianca_logo.svg' },
  { name: 'LATAM', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Latam-logo_-_v2.svg' },
  { name: 'Copa Airlines', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Copa_Airlines_logo.svg' },
  { name: 'Wingo', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Wingo_Logo.svg' },
  { name: 'Satena', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Satena_logo.svg' },
  { name: 'Clic Air', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Easyfly_logo.png' },
  { name: 'JetSmart', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/JetSmart_Logo.svg' },
  { name: 'American Airlines', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/American_Airlines_logo_2013.svg' },
  { name: 'Iberia', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Iberia_Logotipo.svg' },
  { name: 'Air Europa', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Air_Europa_Logo.svg' },
  { name: 'Emirates', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg' },
  { name: 'Qatar Airways', logo: 'https://upload.wikimedia.org/wikipedia/en/9/9b/Qatar_Airways_Logo.svg' },
  { name: 'Delta', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Delta_Air_Lines_logo_%282007%29.svg' },
  { name: 'Air France', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Air_France_Logo.svg' },
  { name: 'Lufthansa', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lufthansa_Logo_2018.svg' },
  { name: 'Turkish Airlines', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Turkish_Airlines_logo_2019.svg' },
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