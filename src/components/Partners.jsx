import React from 'react';

const partners = [
  { name: 'Avianca', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Avianca_logo.svg/800px-Avianca_logo.svg.png' },
  { name: 'LATAM', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Latam-logo_-v_%28Indigo%29.svg/800px-Latam-logo_-v_%28Indigo%29.svg.png' },
  { name: 'Copa Airlines', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Copa_Airlines_Logo.svg/800px-Copa_Airlines_Logo.svg.png' },
  { name: 'Wingo', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Wingo_Logo.svg/800px-Wingo_Logo.svg.png' },
  { name: 'Satena', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Satena_logo.png/800px-Satena_logo.png' },
  { name: 'Clic Air', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Clic_Air_Colombia.webp' },
  { name: 'JetSmart', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/JetSmart_Logo.svg/800px-JetSmart_Logo.svg.png' },
  { name: 'American Airlines', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/American_Airlines_logo_2013.svg/800px-American_Airlines_logo_2013.svg.png' },
  { name: 'Iberia', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Iberia_Airlines_logo.svg/800px-Iberia_Airlines_logo.svg.png' },
  { name: 'Air Europa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Air_Europa_Logo.svg/800px-Air_Europa_Logo.svg.png' },
  { name: 'Emirates', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/800px-Emirates_logo.svg.png' },
  { name: 'Qatar Airways', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Qatar_Airways_Logo.svg/800px-Qatar_Airways_Logo.svg.png' },
  { name: 'Delta', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Delta_logo.svg/800px-Delta_logo.svg.png' },
  { name: 'Air France', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Air_France_Logo.svg/800px-Air_France_Logo.svg.png' },
  { name: 'Lufthansa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lufthansa_Logo_2018.svg/800px-Lufthansa_Logo_2018.svg.png' },
  { name: 'Turkish Airlines', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Turkish_Airlines_logo.svg/800px-Turkish_Airlines_logo.svg.png' },
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