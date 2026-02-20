import React, { useEffect } from 'react';

const SearchBox = () => {
  useEffect(() => {
    const container = document.getElementById('ptw-container');
    if (container) container.innerHTML = '';
    const existing = document.getElementById('ptw-start-script');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'ptw-start-script';
    script.type = 'text/javascript';
    script.src = 'https://widgets.priceres.co/travel-agencyweb/jsonpBooker/startWidget?container=ptw-container&UseConfigs=false&IsHorizontal=true&WhiteLabelId=DestinosPYP';
    document.body.appendChild(script);
    return () => {
      const c = document.getElementById('ptw-container');
      if (c) c.innerHTML = '';
    };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto relative z-30 px-4 pb-6">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl ring-1 ring-white/10 p-3 md:p-4">
        <div id="ptw-container" className="ptw-horizontal-search bookerContainer w-full"></div>
      </div>
      <style>{`
        #ptw-container * {
          border-radius: 12px !important;
          font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif !important;
        }
        #ptw-container button,
        #ptw-container input[type="button"],
        #ptw-container input[type="submit"]{
          background-color: #D4AF37 !important;
          border-color: #D4AF37 !important;
          color: #ffffff !important;
          border-radius: 12px !important;
          font-weight: 800 !important;
          letter-spacing: .02em !important;
          box-shadow: 0 10px 20px rgba(212,175,55,.25) !important;
        }
        #ptw-container button:hover,
        #ptw-container input[type="button"]:hover,
        #ptw-container input[type="submit"]:hover{
          background-color: #b5952f !important;
          border-color: #b5952f !important;
        }
        #ptw-container input[type="text"],
        #ptw-container input[type="date"],
        #ptw-container select{
          border-radius: 12px !important;
        }
        @media (max-width: 768px){
          .ptw-horizontal-search,
          #ptw-container .section__search_box{
            display: block !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBox;
