import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



// --- Constants & Config ---
const LOGO_DESTINOS = '/logo-destinos.png';
const COLORS = {
  primary: [16, 185, 129], // Emerald 500
  secondary: [15, 23, 42], // Slate 900
  accent: [234, 179, 8],   // Yellow 500
  text: [51, 65, 85],      // Slate 700
  lightText: [100, 116, 139], // Slate 500
  white: [255, 255, 255]
};

// --- Helper: Load Image ---
async function loadImage(url) {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        if (!dataUrl) { resolve(null); return; }
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          resolve({ dataUrl, width, height });
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {

    return null;
  }
}

// --- Main Generator Function ---
export async function generateUniversalPdf(type, opts) {
  try {
    // type: 'QUOTE' | 'CONFIRMATION' | 'VOUCHER'
    const {
      folio,
      clientName,
      clientId,
      clientNit,
      clientCostCenter,
      clientEmail,
      clientPhone,
      destination,
      adults = 1,
      children = 0,
      infants = 0,
      dateStart,
      dateEnd,
      duration,
      hotels = [],
      includes = [],
      excludes = '',
      notes = '',
      flights = [],
      flightRows = [],
      luggage = { personal: true, hand: true, checked: false },
      corporateBrand,
      totalInvestment,
      documentsInfo,
      adultRate,
      adultAffiliateRate,
      adultNonAffiliateRate,
      childRate,
      totalToPay,
      infantRate,
      adults: adultsCount,
      adultsAffiliate,
      adultsNonAffiliate,
      children: childrenCount,
      infants: infantsCount,
      currency = 'USD',
      advisorName,
      advisorRole,
      closingNote,
      observacionesImportantes,
      suggestedDates
    } = opts || {};

    // 1. Determine Branding & Titles
    const isCorporate = !!corporateBrand;
    const logoUrl = isCorporate && corporateBrand.logo ? corporateBrand.logo : LOGO_DESTINOS;
    const brandName = isCorporate && corporateBrand.name ? corporateBrand.name : 'Destinos P&P';
    const hasFlightOptions = opts.flightOptions && opts.flightOptions.length > 0;

    let title = 'DOCUMENTO DE VIAJE';
    let subTitle = 'DETALLES DEL SERVICIO';

    if (type === 'QUOTE') {
      title = 'COTIZACIÓN DE SERVICIOS TURÍSTICOS';
      subTitle = 'PROPUESTA DE VIAJE';
    } else if (type === 'CONFIRMATION') {
      title = 'CONFIRMACIÓN DE SERVICIOS';
      subTitle = 'RESERVA CONFIRMADA';
    } else if (type === 'VOUCHER') {
      title = 'VOUCHER DE SERVICIOS';
      subTitle = 'ORDEN DE SERVICIOS';
    }

    // 2. Load Resources
    const logoDestinos = await loadImage(LOGO_DESTINOS);
    const logoCorporate = isCorporate && corporateBrand?.logo ? await loadImage(corporateBrand.logo) : null;

    // 3. Initialize Document
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const footerBarHeight = 30;

    // --- Header ---
    // Background Header Strip
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, 0, pageWidth, 60, 'F'); // Dark top bar

    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 60, pageWidth, 5, 'F'); // Green accent line

    // Logo Handling (Rediseño de Espejo y Excepción Sonreír)
    const isSonreir = brandName && (brandName.toLowerCase().includes('sonreir') || brandName.toLowerCase().includes('sonreír'));
    const boxY = 15;
    const boxHeight = 55;
    const boxWidth = 90;
    const innerBoxPadding = 10;

    // 1. Logo Destinos P&P (A la izquierda, oculto si es Sonreír)
    if (!isSonreir && logoDestinos && logoDestinos.dataUrl) {
      const leftX = margin;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftX, boxY, boxWidth, boxHeight, 5, 5, 'F');

      const imgWidth = logoDestinos.width || boxWidth;
      const imgHeight = logoDestinos.height || boxHeight;
      const maxWidth = boxWidth - innerBoxPadding;
      const maxHeight = boxHeight - innerBoxPadding;
      const imgRatio = imgWidth / imgHeight;
      const boxRatio = maxWidth / maxHeight;

      let dWidth, dHeight;
      if (imgRatio >= boxRatio) {
        dWidth = maxWidth;
        dHeight = dWidth / imgRatio;
      } else {
        dHeight = maxHeight;
        dWidth = dHeight * imgRatio;
      }

      doc.addImage(logoDestinos.dataUrl, 'PNG', leftX + (boxWidth - dWidth) / 2, boxY + (boxHeight - dHeight) / 2, dWidth, dHeight);
    }

    // 2. Logo Empresa Cliente (A la derecha)
    if (isCorporate && logoCorporate && logoCorporate.dataUrl) {
      const rightX = pageWidth - margin - boxWidth;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(rightX, boxY, boxWidth, boxHeight, 5, 5, 'F');

      const imgWidth = logoCorporate.width || boxWidth;
      const imgHeight = logoCorporate.height || boxHeight;
      const maxWidth = boxWidth - innerBoxPadding;
      const maxHeight = boxHeight - innerBoxPadding;
      const imgRatio = imgWidth / imgHeight;
      const boxRatio = maxWidth / maxHeight;

      let dWidth, dHeight;
      if (imgRatio >= boxRatio) {
        dWidth = maxWidth;
        dHeight = dWidth / imgRatio;
      } else {
        dHeight = maxHeight;
        dWidth = dHeight * imgRatio;
      }

      doc.addImage(logoCorporate.dataUrl, 'PNG', rightX + (boxWidth - dWidth) / 2, boxY + (boxHeight - dHeight) / 2, dWidth, dHeight);
    }

    // 3. Título Centrado (Protegiendo el centro del documento para que nunca se pise)
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14); // Tamaño moderado para garantizar visibilidad total
    doc.text(title, pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.accent);
    doc.text(subTitle, pageWidth / 2, 52, { align: 'center' });

    // --- Info Header (Folio, Date, TRM) ---
    let y = 100;

    // Standard Info Header (Universal Style)
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 60, 5, 5, 'FD');

    const col1 = margin + 20;
    const col2 = margin + 200;

    // Row 1
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.lightText);
    doc.text('FECHA DE EMISIÓN', col1, y + 20);
    doc.text('NÚMERO DE FOLIO', col2, y + 20);

    // Row 2 (Values)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text(new Date().toLocaleDateString(), col1, y + 40);
    doc.text(folio || 'PENDIENTE', col2, y + 40);

    y += 80;

    // (Banner Photo Eliminated by User Request)

    // --- Client & Trip Details ---
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.primary);
    doc.text('Información del Viaje', margin, y);

    // Line separator
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(1);
    doc.line(margin, y + 5, pageWidth - margin, y + 5);

    y += 25;

    // Client Details Box
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);

    // --- Left Column: Client ---
    const isCorporateQuote = !!(clientNit || clientCostCenter);
    doc.setFont('helvetica', 'bold');
    doc.text(isCorporateQuote ? 'DATOS DE LA EMPRESA:' : 'DATOS DEL CLIENTE:', margin, y);
    doc.setFont('helvetica', 'normal');

    // Support long names with wrapping
    const maxClientNameWidth = (pageWidth / 2) - margin - 20;
    const splitClientName = doc.splitTextToSize(clientName || '—', maxClientNameWidth);
    doc.text(splitClientName, margin, y + 15);

    let clientRowY = y + 15 + (splitClientName.length * 12);

    if (isCorporateQuote) {
      if (clientNit) { doc.text(`NIT: ${clientNit}`, margin, clientRowY); clientRowY += 15; }
      if (clientCostCenter) {
        const splitCC = doc.splitTextToSize(`Centro de Costo: ${clientCostCenter}`, maxClientNameWidth);
        doc.text(splitCC, margin, clientRowY);
        clientRowY += (splitCC.length * 15);
      }
    } else {
      if (clientId) { doc.text(`CC/ID: ${clientId}`, margin, clientRowY); clientRowY += 15; }
    }
    if (clientEmail) { doc.text(clientEmail, margin, clientRowY); clientRowY += 15; }
    if (clientPhone) { doc.text(clientPhone, margin, clientRowY); }

    // --- Right Column: Destination & Dates ---
    const rightCol = pageWidth / 2 + 20;
    let rightColY = y;

    doc.setFont('helvetica', 'bold');
    doc.text('DESTINO Y FECHAS:', rightCol, rightColY);
    doc.setFont('helvetica', 'normal');
    rightColY += 15;

    const dest = destination || (opts.cruiseData ? opts.cruiseData.destination : null);
    if (dest) {
      doc.text(dest, rightCol, rightColY);
      rightColY += 15;
    }

    if (suggestedDates) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.primary);
      doc.text(`FECHA SUGERIDA: ${suggestedDates.toUpperCase()}`, rightCol, rightColY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      rightColY += 15;
    }

    if (dateStart && dateEnd) {
      const start = new Date(dateStart);
      const end = new Date(dateEnd);
      doc.text(`${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, rightCol, rightColY);
      rightColY += 15;

      const ms = end.getTime() - start.getTime();
      const nights = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
      const durationText = duration ? duration : `${nights} Noche${nights !== 1 ? 's' : ''}`;
      doc.text(durationText, rightCol, rightColY);
      rightColY += 15;
    } else if (duration) {
      doc.text(duration, rightCol, rightColY);
      rightColY += 15;
    } else if (opts.cruiseData && opts.cruiseData.plan) {
      doc.text(`Plan: ${opts.cruiseData.plan}`, rightCol, rightColY);
      rightColY += 15;
    }

    const paxAdults = parseInt(adultsCount) || parseInt(adults) || 0;
    const paxChildren = parseInt(childrenCount) || parseInt(children) || 0;
    const paxInfants = parseInt(infantsCount) || parseInt(infants) || 0;

    if (paxAdults || paxChildren || paxInfants) {
      const pax = [];
      if (paxAdults) pax.push(`${paxAdults} Adulto${paxAdults > 1 ? 's' : ''}`);
      if (paxChildren) pax.push(`${paxChildren} Niño${paxChildren > 1 ? 's' : ''}`);
      if (paxInfants) pax.push(`${paxInfants} Infante${paxInfants > 1 ? 's' : ''}`);
      doc.text(`Pasajeros: ${pax.join(', ')}`, rightCol, rightColY);
      rightColY += 15;
    }

    // Set y to the bottom of the tallest column plus some padding
    y = Math.max(clientRowY, rightColY) + 30;

    // --- Cruise Header Info (Plan & Accommodation) ---
    if (opts.cruiseData && (opts.cruiseData.plan || opts.cruiseData.accommodation)) {
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.roundedRect(margin, y - 10, pageWidth - (margin * 2), 40, 5, 5, 'FD');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.secondary);
      doc.text('DETALLES DEL CRUCERO:', margin + 15, y + 15);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      if (opts.cruiseData.plan) {
        doc.text(`PLAN: ${opts.cruiseData.plan.toUpperCase()}`, margin + 130, y + 15);
      }
      if (opts.cruiseData.accommodation) {
        doc.text(`ACOMODACIÓN: ${opts.cruiseData.accommodation.toUpperCase()}`, margin + 300, y + 15);
      }
      y += 45;
    }


    // --- Helper: Centered Title with Underline ---
    const addSectionTitle = (title, yPos) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.secondary);
      doc.text(title.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });

      // Decorative Underline
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(1.5);
      doc.line(pageWidth / 2 - 60, yPos + 5, pageWidth / 2 + 60, yPos + 5);
      return yPos + 25;
    };

    // --- Services Tables ---

    // 1. Flight Options (Multi-Option Mode)
    if (hasFlightOptions) {
      y = addSectionTitle('Opciones de Vuelo', y);

      for (const option of opts.flightOptions) {
        if (y > pageHeight - 150) {
          doc.addPage();
          y = 60;
        }

        // Option Header Box
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin, y, pageWidth - (margin * 2), 55, 5, 5, 'FD');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.secondary);
        doc.text(option.title || 'Opción de Vuelo', margin + 15, y + 20);

        if (option.priceUsd) {
          doc.setFontSize(10);
          doc.setTextColor(...COLORS.primary);
          doc.text(`${option.priceUsd} ${currency}`, pageWidth - margin - 15, y + 20, { align: 'right' });
        }

        const optLuggage = [];
        if (option.luggage?.personal) optLuggage.push('Personal');
        if (option.luggage?.hand) optLuggage.push('Mano 10kg');
        if (option.luggage?.checked) optLuggage.push('Bodega 23kg');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.lightText);
        doc.text(`Incluye: ${optLuggage.join(' + ') || 'Solo asiento'}`, margin + 15, y + 35);

        y += 65;

        if (option.flights && option.flights.length > 0) {
          autoTable(doc, {
            startY: y,
            head: [['Información de Vuelo', 'Ruta', 'Fecha y Hora']],
            body: option.flights.map(f => {
              const flightInfo = f.airline === f.flight ? (f.airline || '—') : `${f.airline || ''} ${f.flight || ''}`.trim();
              return [
                flightInfo,
                f.route || '—',
                f.flightDate || '—'
              ];
            }),
            headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { textColor: COLORS.text, fontSize: 9 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: margin, right: margin },
            theme: 'grid'
          });
          y = doc.lastAutoTable.finalY + 20;
        }

        // Propuesta Económica del Vuelo
        const fRates = option.rates || {};
        const fTotalPay = parseFloat(option.totalToPay) || 0;

        if (fTotalPay > 0 || parseFloat(fRates.adultAffiliate) > 0 || parseFloat(fRates.adultNonAffiliate) > 0) {
          const pricingBoxH = 140;
          if (y + pricingBoxH + 20 > pageHeight - footerBarHeight) { doc.addPage(); y = 60; }

          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(margin, y, pageWidth - (margin * 2), pricingBoxH, 8, 8, 'FD');

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text('PROPUESTA ECONÓMICA', margin + 15, y + 20);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          let pY = y + 40;
          const fmtPrice = (v) => `${currency} $ ${parseFloat(v || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;

          const pAdultAfil = parseInt(adultsAffiliate) || 0;
          const pAdultNoAfil = parseInt(adultsNonAffiliate) || 0;
          const pChild = parseInt(childrenCount) || parseInt(children) || 0;
          const pInf = parseInt(infantsCount) || parseInt(infants) || 0;

          if (pAdultAfil > 0 && parseFloat(fRates.adultAffiliate) > 0) {
            const label = quoteType === 'vacacional' ? 'Adulto(s)' : 'Adulto(s) (Afiliado)';
            doc.text(`${pAdultAfil} ${label} × ${fmtPrice(fRates.adultAffiliate)}`, margin + 20, pY);
            doc.text(fmtPrice((parseFloat(fRates.adultAffiliate) || 0) * pAdultAfil), pageWidth - margin - 20, pY, { align: 'right' });
            pY += 15;
          }
          if (quoteType !== 'vacacional' && pAdultNoAfil > 0 && parseFloat(fRates.adultNonAffiliate) > 0) {
            doc.text(`${pAdultNoAfil} Adulto(s) (No Afiliado) × ${fmtPrice(fRates.adultNonAffiliate)}`, margin + 20, pY);
            doc.text(fmtPrice((parseFloat(fRates.adultNonAffiliate) || 0) * pAdultNoAfil), pageWidth - margin - 20, pY, { align: 'right' });
            pY += 15;
          }
          if (pChild > 0 && parseFloat(fRates.child) > 0) {
            doc.text(`${pChild} Niño(s) × ${fmtPrice(fRates.child)}`, margin + 20, pY);
            doc.text(fmtPrice((parseFloat(fRates.child) || 0) * pChild), pageWidth - margin - 20, pY, { align: 'right' });
            pY += 15;
          }
          if (pInf > 0 && parseFloat(fRates.infant) > 0) {
            doc.text(`${pInf} Infante(s) × ${fmtPrice(fRates.infant)}`, margin + 20, pY);
            doc.text(fmtPrice((parseFloat(fRates.infant) || 0) * pInf), pageWidth - margin - 20, pY, { align: 'right' });
            pY += 15;
          }

          // Total Bar
          doc.setFillColor(15, 23, 42);
          doc.roundedRect(margin, y + pricingBoxH - 35, pageWidth - (margin * 2), 35, 0, 0, 'F');
          doc.roundedRect(margin, y + pricingBoxH - 35, pageWidth - (margin * 2), 35, 8, 8, 'F');
          doc.rect(margin, y + pricingBoxH - 35, pageWidth - (margin * 2), 15, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(255, 255, 255);
          doc.text('TOTAL ESTA OPCIÓN', margin + 15, y + pricingBoxH - 12);
          doc.setFontSize(14);
          doc.setTextColor(52, 211, 153);
          doc.text(fmtPrice(fTotalPay), pageWidth - margin - 15, y + pricingBoxH - 12, { align: 'right' });

          y += pricingBoxH + 20;
        }
      }
      y += 10;
    }
    else {
      // Solo mostrar Itinerario Aéreo GLOBAL si NO es una cotización (es Confirmación/Voucher)
      // En cotizaciones, ahora irá dentro de cada opción.
      const allFlights = [...(flights || []), ...(flightRows || [])];
      if (allFlights.length > 0 && type !== 'QUOTE') {
        y = addSectionTitle('Itinerario Aéreo', y);

        const isConfirmation = type === 'CONFIRMATION' || type === 'VOUCHER';

        if (isConfirmation) {
          autoTable(doc, {
            startY: y,
            head: [['IDENTIFICACIÓN', 'PASAJERO', 'ITINERARIO', 'OBSERVACIONES']],
            body: allFlights.map(f => [
              `${f.airline || '—'}\nTK: ${f.eticket || '—'}\nPNR: ${f.pnr || '—'}`,
              `${f.passengerName || '—'}\nDOC: ${f.passengerId || '—'}`,
              `${f.route || '—'}\nFECHA: ${f.flightDate || '—'}\nHORA: ${f.depTime || '—'} > ${f.arrTime || '—'}`,
              f.observaciones || '—'
            ]),
            headStyles: { fillColor: [30, 64, 175], textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { textColor: COLORS.text, fontSize: 8, cellPadding: 8 },
            alternateRowStyles: { fillColor: [240, 249, 255] },
            margin: { left: margin, right: margin },
            theme: 'grid'
          });
        } else {
          autoTable(doc, {
            startY: y,
            head: [['Aerolínea', 'Vuelo', 'Ruta', 'Fecha', 'Salida', 'Llegada', 'Observaciones']],
            body: allFlights.map(f => [
              f.airline || '—',
              f.flight || '—',
              f.route || (f.departure ? `${f.departure} > ${f.arrival}` : '—'),
              f.flightDate || '—',
              f.depTime || '—',
              f.arrTime || '—',
              f.observaciones || '—'
            ]),
            headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { textColor: COLORS.text, fontSize: 8 },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            margin: { left: margin, right: margin }
          });
        }

        y = doc.lastAutoTable.finalY + 15;

        // --- Luggage Section ---
        const globalLuggage = opts.luggage || { personal: true, hand: true, checked: false };
        const luggageList = [];
        if (globalLuggage.personal) luggageList.push('Artículo Personal');
        if (globalLuggage.hand) luggageList.push('Equipaje de Mano (10kg)');
        if (globalLuggage.checked) luggageList.push('Equipaje de Bodega (23kg)');

        if (luggageList.length > 0) {
          doc.setFillColor(241, 245, 249);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(margin, y, pageWidth - (margin * 2), 35, 5, 5, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(...COLORS.secondary);
          doc.text('EQUIPAJE INCLUIDO:', margin + 15, y + 20);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...COLORS.text);
          doc.text(luggageList.join('  •  '), margin + 130, y + 20);

          y += 55;
        } else {
          y += 15;
        }
      }
    }

    // --- Financial Block (New: Venta, Comisiones, Margen) ---
    if (opts.financials) {
      if (y > pageHeight - 150) {
        doc.addPage();
        y = 60;
      }
      y = addSectionTitle(`Resumen Financiero (${currency})`, y);

      const { totalSale, commission, margin: profitMargin } = opts.financials;

      autoTable(doc, {
        startY: y,
        head: [['CONCEPTO', `VALOR ${currency}`]],
        body: [
          ['VENTA TOTAL', `$ ${parseFloat(totalSale || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
          ['COMISIONES', `$ ${parseFloat(commission || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
          ['MARGEN DE UTILIDAD', `$ ${parseFloat(profitMargin || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`]
        ],
        headStyles: { fillColor: [15, 23, 42], textColor: COLORS.white, fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { textColor: COLORS.text, fontSize: 9, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 200 },
          1: { halign: 'right' }
        },
        margin: { left: margin, right: margin },
        theme: 'striped'
      });

      y = doc.lastAutoTable.finalY + 30;
    }

    // 1.5. Cruise Itinerary
    if (opts.cruiseItinerary && opts.cruiseItinerary.length > 0) {
      if (y > pageHeight - 150) {
        doc.addPage();
        y = 60;
      }
      y = addSectionTitle('Itinerario del Crucero', y);

      autoTable(doc, {
        startY: y,
        head: [['Día', 'Fecha', 'Puerto', 'Llegada', 'Salida']],
        body: opts.cruiseItinerary.map(row => [
          row.day || '—',
          row.date || '—',
          row.port || '—',
          row.arr || '—',
          row.dep || '—'
        ]),
        headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white, fontStyle: 'bold' },
        bodyStyles: { textColor: COLORS.text },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: margin, right: margin },
        theme: 'grid'
      });
      y = doc.lastAutoTable.finalY + 30;
    }

    // --- 2. LOOP DE OPCIONES (Alojamiento + Galería + Beneficios + Precio) ---
    if (hotels && hotels.length > 0) {
      for (const [idx, hotel] of hotels.entries()) {
        // Asegurar salto de página si es necesario para el título
        if (y > pageHeight - 100) { doc.addPage(); y = 60; }

        // Título de la Opción
        const optionTitle = hotel.name
          ? `OPCIÓN ${idx + 1}: ${hotel.name.toUpperCase()}`
          : `OPCIÓN ${idx + 1}`;
        y = addSectionTitle(optionTitle, y);

        // --- NUEVO: Itinerario Aéreo dentro de la Opción ---
        const allOptionFlights = [...(flights || []), ...(flightRows || [])];
        if (allOptionFlights.length > 0 && type === 'QUOTE') {
          autoTable(doc, {
            startY: y,
            head: [['Vuelos e Itinerario Aéreo Seleccionado']],
            body: [['']],
            theme: 'plain',
            headStyles: { fillColor: [241, 245, 249], textColor: COLORS.secondary, fontStyle: 'bold', fontSize: 9, halign: 'center' },
            margin: { left: margin, right: margin }
          });
          y = doc.lastAutoTable.finalY;

          autoTable(doc, {
            startY: y,
            head: [['Aerolínea', 'Vuelo', 'Ruta', 'Fecha', 'Horario']],
            body: allOptionFlights.map(f => [
              f.airline || '—',
              f.flight || '—',
              f.route || (f.departure ? `${f.departure} > ${f.arrival}` : '—'),
              f.flightDate || '—',
              `${f.depTime || '—'} > ${f.arrTime || '—'}`
            ]),
            headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { textColor: COLORS.text, fontSize: 8 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: margin, right: margin },
            theme: 'grid'
          });
          y = doc.lastAutoTable.finalY + 10;

          // Equipaje por opción
          const globalLuggage = opts.luggage || { personal: true, hand: true, checked: false };
          const luggageList = [];
          if (globalLuggage.personal) luggageList.push('Artículo Personal');
          if (globalLuggage.hand) luggageList.push('Mano 10kg');
          if (globalLuggage.checked) luggageList.push('Bodega 23kg');

          if (luggageList.length > 0) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...COLORS.lightText);
            doc.text(`EQUIPAJE: ${luggageList.join(' + ')}`, margin, y + 5);
            y += 30; // Más espacio para evitar que pegue con el siguiente título
          }
        }

        // Subtítulo Alojamiento
        y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text('DETALLES DE ALOJAMIENTO:', margin, y);
        y += 20; // Un poco más de espacio antes de la tabla

        // Tabla de Detalles del Hotel
        autoTable(doc, {
          startY: y,
          head: [['Categoría', 'Tipo Habitación', 'Noches', 'Régimen / Observaciones']],
          body: [[
            hotel.category || '—',
            hotel.room || '—',
            (() => {
              try {
                if (dateStart && dateEnd) {
                  const s = new Date(dateStart);
                  const e = new Date(dateEnd);
                  if (!isNaN(s) && !isNaN(e)) {
                    const diff = Math.round((e - s) / (86400000));
                    return diff >= 0 ? diff : '—';
                  }
                }
              } catch (err) { }
              return '—';
            })(),
            hotel.observaciones || hotel.notes || '—'
          ]],
          headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { textColor: COLORS.text, fontSize: 8 },
          margin: { left: margin, right: margin },
          theme: 'grid'
        });
        y = doc.lastAutoTable.finalY + 15;

        // Galería del Hotel (Específica de esta opción)
        const hImages = hotel.images || [];
        if (hotel.showGallery && hImages.length > 0) {
          const galleryMargin = margin + 10;
          const availableWidth = pageWidth - (galleryMargin * 2);
          const gap = 8;
          const columns = 3;
          const imgWidth = (availableWidth - (gap * (columns - 1))) / columns;
          const imgHeight = imgWidth * 0.7; // Aspect ratio más profesional

          if (y + imgHeight + 20 > pageHeight - footerBarHeight) {
            doc.addPage();
            y = 60;
          }

          // Dibujar hasta 3 imágenes en una fila compacta
          hImages.slice(0, 3).forEach((imgData, imgIdx) => {
            const posX = galleryMargin + (imgIdx * (imgWidth + gap));
            try {
              // Añadir un borde sutil o sombra simulada si fuera posible, por ahora solo la imagen
              doc.setDrawColor(226, 232, 240);
              doc.rect(posX - 1, y - 1, imgWidth + 2, imgHeight + 2, 'S');
              doc.addImage(imgData, 'JPEG', posX, y, imgWidth, imgHeight, undefined, 'FAST');
            } catch (e) {

            }
          });

          y += imgHeight + 20; // Espacio justo debajo de la fila de fotos
        }

        // Itinerario Día a Día (Específico de esta opción) - SOPORTE MULTI-PÁGINA REFACTOREADO
        if (hotel.showItinerary && hotel.itineraryText && hotel.itineraryText.trim() !== '') {
          const textWidthItin = pageWidth - (margin * 2) - 50;
          const splitLines = doc.splitTextToSize(hotel.itineraryText, textWidthItin);
          const lineHeight = 15;
          const footerLimit = pageHeight - footerBarHeight - 20;

          // Helper para dibujar el fondo de un segmento
          const drawSectionBg = (startY, endY) => {
            const h = endY - startY + 10;
            doc.setFillColor(240, 253, 244); // Emerald tenue
            doc.roundedRect(margin, startY, pageWidth - (margin * 2), h, 6, 6, 'F');
            doc.setFillColor(...COLORS.primary);
            doc.rect(margin, startY, 4, h, 'F');
          };

          // Validar si el título cabe en la página actual o salto preventivo
          if (y + 60 > footerLimit) { doc.addPage(); y = 60; }

          // 1. Segmentar líneas por página
          let pageGroups = [[]];
          let currentPageIdx = 0;
          let tempY = y + 45; // Estimación inicial con título

          splitLines.forEach((line) => {
            if (tempY + lineHeight > footerLimit) {
              pageGroups.push([]);
              currentPageIdx++;
              tempY = 60 + 40; // Nueva página empieza en 60 + margen de encabezado
            }
            pageGroups[currentPageIdx].push(line);
            tempY += lineHeight;
          });

          // 2. Renderizar cada grupo
          let currentY = y;
          pageGroups.forEach((pageLines, pIdx) => {
            if (pIdx > 0) {
              doc.addPage();
              currentY = 60;
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(8);
              doc.setTextColor(...COLORS.primary);
              doc.text('(CONTINUACIÓN ITINERARIO)', margin + 20, currentY + 15);
              currentY += 25;
            }

            const isFirst = (pIdx === 0);
            const startY = currentY;
            const textStartY = isFirst ? currentY + 42 : currentY + 10;
            const segmentEndY = textStartY + (pageLines.length * lineHeight);

            // A. DIBUJAR FONDO PRIMERO (Para que no tape el texto)
            drawSectionBg(startY, segmentEndY);

            // B. DIBUJAR TÍTULO (Solo en la primera página del itinerario)
            if (isFirst) {
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(...COLORS.primary);
              doc.text('ITINERARIO DETALLADO:', margin + 20, startY + 22);
            }

            // C. DIBUJAR LÍNEAS DE TEXTO
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.text);
            let lineY = textStartY;
            pageLines.forEach(lineText => {
              // Viñeta
              doc.setFillColor(...COLORS.primary);
              doc.circle(margin + 15, lineY - 3, 1, 'F');

              if (lineText.toLowerCase().includes('día')) {
                doc.setFont('helvetica', 'bold');
                doc.text(lineText, margin + 22, lineY);
                doc.setFont('helvetica', 'normal');
              } else {
                doc.text(lineText, margin + 22, lineY);
              }
              lineY += lineHeight;
            });

            currentY = segmentEndY + 10;
          });

          y = currentY + 10;
        }

        // Beneficios Incluidos - ELIMINADO (Ahora es general al final)

        // Propuesta Económica (Específica de este hotel)
        const hPricing = hotel.pricing || {};
        const hTotalValue = parseFloat(hPricing.totalToPay) || 0;

        if (hTotalValue > 0) {
          const pricingBoxH = 140;
          if (y + pricingBoxH + 20 > pageHeight - footerBarHeight) { doc.addPage(); y = 60; }

          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(margin, y, pageWidth - (margin * 2), pricingBoxH, 8, 8, 'FD');

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text('PROPUESTA ECONÓMICA', margin + 15, y + 20);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          let pY = y + 40;
          const fmtPrice = (v) => `${currency} $ ${parseFloat(v || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;

          if (parseInt(adultsAffiliate) > 0) {
            const label = quoteType === 'vacacional' ? 'Adulto(s)' : 'Adulto(s) (Afiliado)';
            doc.text(`${adultsAffiliate} ${label} × ${fmtPrice(hPricing.adultAffiliateRate)}`, margin + 20, pY);
            doc.text(fmtPrice((parseFloat(hPricing.adultAffiliateRate) || 0) * parseInt(adultsAffiliate)), pageWidth - margin - 20, pY, { align: 'right' });
            pY += 15;
          }
          if (quoteType !== 'vacacional' && parseInt(adultsNonAffiliate) > 0) {
            doc.text(`${adultsNonAffiliate} Adulto(s) (No Afiliado) × ${fmtPrice(hPricing.adultNonAffiliateRate)}`, margin + 20, pY);
            doc.text(fmtPrice((parseFloat(hPricing.adultNonAffiliateRate) || 0) * parseInt(adultsNonAffiliate)), pageWidth - margin - 20, pY, { align: 'right' });
            pY += 15;
          }
          if (parseInt(childrenCount || children) > 0 && parseFloat(hPricing.childRate) > 0) {
            doc.text(`${childrenCount || children} Niño(s) × ${fmtPrice(hPricing.childRate)}`, margin + 20, pY);
            doc.text(fmtPrice((parseFloat(hPricing.childRate) || 0) * parseInt(childrenCount || children)), pageWidth - margin - 20, pY, { align: 'right' });
            pY += 15;
          }
          if (parseInt(infantsCount || infants) > 0 && parseFloat(hPricing.infantRate) > 0) {
            doc.text(`${infantsCount || infants} Infante(s) × ${fmtPrice(hPricing.infantRate)}`, margin + 20, pY);
            doc.text(fmtPrice((parseFloat(hPricing.infantRate) || 0) * parseInt(infantsCount || infants)), pageWidth - margin - 20, pY, { align: 'right' });
            pY += 15;
          }

          // Total Bar
          doc.setFillColor(15, 23, 42);
          doc.roundedRect(margin, y + pricingBoxH - 35, pageWidth - (margin * 2), 35, 0, 0, 'F');
          doc.roundedRect(margin, y + pricingBoxH - 35, pageWidth - (margin * 2), 35, 8, 8, 'F');
          doc.rect(margin, y + pricingBoxH - 35, pageWidth - (margin * 2), 15, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(255, 255, 255);
          doc.text('VALOR SEGÚN OPCIÓN SELECCIONADA', margin + 15, y + pricingBoxH - 12);
          doc.setFontSize(14);
          doc.setTextColor(52, 211, 153);
          doc.text(fmtPrice(hTotalValue), pageWidth - margin - 15, y + pricingBoxH - 12, { align: 'right' });

          y += pricingBoxH + 20;
        }

        // Hoteles Previstos (Específico de esta opción)
        if (hotel.showExpectedHotels && hotel.expectedHotelsImage) {
          const loadedImg = await loadImage(hotel.expectedHotelsImage);
          if (loadedImg) {
            // Ajuste Premium: Máximo 10cm de ancho
            const maxExpectedWidth = 283.46; // 10cm
            const imgWidth = Math.min(pageWidth - (margin * 2), maxExpectedWidth);
            const imgHeight = imgWidth * (loadedImg.height / loadedImg.width);

            if (y + imgHeight + 20 > pageHeight - footerBarHeight) {
              doc.addPage();
              y = 60;
            }

            try {
              // Centrar horizontalmente
              const posX = margin + (pageWidth - (margin * 2) - imgWidth) / 2;
              doc.addImage(loadedImg.dataUrl, 'JPEG', posX, y, imgWidth, imgHeight);
              y += imgHeight + 20;
            } catch (e) {

            }
          }
        }

        // Separador visual entre opciones si no es la última
        if (idx < hotels.length - 1) {
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, y, pageWidth - margin, y);
          y += 15;
        }
      }
    }

    y += 10;


    // 2.5. Ground Logistics
    if (opts.groundLogistics && (opts.groundLogistics.meetPoint || opts.groundLogistics.meetDate || opts.groundLogistics.operator)) {
      if (y > pageHeight - 150) {
        doc.addPage();
        y = 60;
      }
      y = addSectionTitle('Logística de Transporte', y);

      autoTable(doc, {
        startY: y,
        head: [['Punto de Encuentro', 'Fecha', 'Hora']],
        body: [[
          opts.groundLogistics.meetPoint || '—',
          opts.groundLogistics.meetDate || '—',
          opts.groundLogistics.meetTime || '—'
        ]],
        headStyles: { fillColor: [45, 212, 191], textColor: COLORS.white, fontStyle: 'bold' },
        bodyStyles: { textColor: COLORS.text },
        margin: { left: margin, right: margin },
        theme: 'grid'
      });
      y = doc.lastAutoTable.finalY + 30;
    }


    // --- 2.8. Servicios Adicionales (Venta Cruzada) ---
    if (opts.additionalServices) {
      const { cruise, car, medical } = opts.additionalServices;

      if (cruise && (cruise.shippingLine || cruise.cabinType || cruise.ports)) {
        if (y > pageHeight - 150) { doc.addPage(); y = 60; }
        y = addSectionTitle('Detalles del Crucero Adicional', y);
        autoTable(doc, {
          startY: y,
          head: [['Naviera', 'Cabina', 'Itinerario / Puertos']],
          body: [[cruise.shippingLine || '—', cruise.cabinType || '—', cruise.ports || '—']],
          headStyles: { fillColor: [37, 99, 235], textColor: COLORS.white, fontStyle: 'bold' },
          bodyStyles: { textColor: COLORS.text },
          margin: { left: margin, right: margin },
          theme: 'grid'
        });
        y = doc.lastAutoTable.finalY + 20;
      }

      if (car && (car.category || car.pickupCity || car.days)) {
        if (y > pageHeight - 150) { doc.addPage(); y = 60; }
        y = addSectionTitle('Alquiler de Vehículo Adicional', y);
        autoTable(doc, {
          startY: y,
          head: [['Categoría', 'Entrega / Devolución', 'Días Rentado']],
          body: [[car.category || '—', car.pickupCity || '—', car.days || '—']],
          headStyles: { fillColor: [217, 119, 6], textColor: COLORS.white, fontStyle: 'bold' },
          bodyStyles: { textColor: COLORS.text },
          margin: { left: margin, right: margin },
          theme: 'grid'
        });
        y = doc.lastAutoTable.finalY + 20;
      }

      if (medical && (medical.coverage || medical.ages || medical.travelDays)) {
        if (y > pageHeight - 150) { doc.addPage(); y = 60; }
        y = addSectionTitle('Asistencia Médica Internacional Adicional', y);
        autoTable(doc, {
          startY: y,
          head: [['Cobertura', 'Edades', 'Días de Viaje']],
          body: [[medical.coverage || '—', medical.ages || '—', medical.travelDays || '—']],
          headStyles: { fillColor: [225, 29, 72], textColor: COLORS.white, fontStyle: 'bold' },
          bodyStyles: { textColor: COLORS.text },
          margin: { left: margin, right: margin },
          theme: 'grid'
        });
        y = doc.lastAutoTable.finalY + 20;
      }
    }


    // --- Footer / Notes / Closure ---



    // --- 0A. INCLUYE ---
    if (includes && (Array.isArray(includes) ? includes.length > 0 : String(includes).trim() !== '')) {
      const includeItems = Array.isArray(includes)
        ? includes
        : String(includes).split('\n').map(l => l.trim()).filter(Boolean);

      const lineSpacing = 15;
      const sectionHeight = 30 + includeItems.length * lineSpacing + 20;

      if (y + sectionHeight + footerBarHeight + 20 > pageHeight) {
        doc.addPage();
        y = 60;
      }

      // Emerald Theme (Matching the Includes style)
      doc.setFillColor(240, 253, 244); // emerald-50
      doc.setDrawColor(110, 231, 183); // emerald-300
      doc.roundedRect(margin, y, pageWidth - (margin * 2), sectionHeight, 5, 5, 'FD');

      // Title
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text('EL PRECIO INCLUYE', margin + 15, y + 20);

      // Bullets
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(6, 78, 59); // emerald-800

      let currentY = y + 35;
      includeItems.forEach(item => {
        doc.setFillColor(16, 185, 129); // emerald-500
        doc.circle(margin + 18, currentY - 3, 2, 'F');
        doc.text(item, margin + 25, currentY);
        currentY += lineSpacing;
      });

      y += sectionHeight + 15;
    }

    // --- 0B. NO INCLUYE ---
    if (excludes && String(excludes).trim() !== '') {
      const rawExcludes = String(excludes);
      const excludeItems = rawExcludes.split('\n').map(l => l.trim()).filter(Boolean);

      const lineSpacing = 15;
      const sectionHeight = 30 + excludeItems.length * lineSpacing + 20;

      if (y + sectionHeight + footerBarHeight + 20 > pageHeight) {
        doc.addPage();
        y = 60;
      }

      // Rose/Red Theme
      doc.setFillColor(255, 241, 242); // rose-50
      doc.setDrawColor(253, 164, 175); // rose-300
      doc.roundedRect(margin, y, pageWidth - (margin * 2), sectionHeight, 5, 5, 'FD');

      // Title
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38); // red-600
      doc.text('NO INCLUYE', margin + 15, y + 20);

      // Bullets
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(153, 27, 27); // red-800

      let currentY = y + 35;
      excludeItems.forEach(item => {
        doc.setFillColor(220, 38, 38); // red-600
        doc.circle(margin + 18, currentY - 3, 2, 'F');
        doc.text(item, margin + 25, currentY);
        currentY += lineSpacing;
      });

      y += sectionHeight + 15;
    }

    // Separador visual
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    // --- 1. OBSERVACIONES IMPORTANTES ---
    const defaultObs = [
      'Aplica penalidad por cambios y cancelaciones.',
      'Después de emitido el tiquete todo cambio genera penalidad.',
      'Los reembolsos solo aplican si las condiciones de la tarifa lo permiten.'
    ];

    // Si el asesor editó las observaciones en el formulario, usar esas; si no, los fijos por defecto
    const rawObs = observacionesImportantes || '';
    let obsItems = rawObs.trim()
      ? rawObs.split('\n').map(l => l.trim()).filter(Boolean)
      : [...defaultObs];
    // Añadir notas adicionales del campo "notes" si existen
    if (notes && notes.trim()) {
      const noteLines = notes.split('\n').map(l => l.trim()).filter(Boolean);
      obsItems = [...obsItems, ...noteLines];
    }

    const lineSpacing = 15;
    const sectionHeight = 30 + obsItems.length * lineSpacing + 20;

    if (y + sectionHeight + footerBarHeight + 20 > pageHeight) {
      doc.addPage();
      y = 60;
    }

    // Red Theme (Same as No Incluye)
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(252, 165, 165); // red-200
    doc.roundedRect(margin, y, pageWidth - (margin * 2), sectionHeight, 5, 5, 'FD');

    // Title
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38); // red-600
    doc.text('OBSERVACIONES IMPORTANTES', margin + 15, y + 20);

    // Bullets
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(153, 27, 27); // red-800

    let currentY = y + 35;
    obsItems.forEach(item => {
      doc.setFillColor(220, 38, 38);
      doc.circle(margin + 18, currentY - 3, 2, 'F');
      doc.text(item, margin + 25, currentY);
      currentY += lineSpacing;
    });

    y += sectionHeight + 15;

    // Padding compartido para bloques de cierre
    const boxPadding = 15;



    // --- 2. DOCUMENTOS REQUERIDOS ---
    {
      const DEFAULT_DOC_ITEMS = [
        'Cédula de ciudadanía original',
        'Pasaporte vigente (Solo vuelos internacionales)',
        'Visas o permisos de ingreso (si aplica)',
        'Vacuna de Fiebre Amarilla (si aplica)'
      ];
      // Si el asesor editó el texto, usar esas líneas; si no, usarlos por defecto
      const rawDocs = documentsInfo || opts.documentsInfo || '';
      const docItems = rawDocs.trim()
        ? rawDocs.split('\n').map(l => l.trim()).filter(Boolean)
        : DEFAULT_DOC_ITEMS;

      const lineSpacing = 15;
      const docsBoxH = 30 + docItems.length * lineSpacing + 20;

      if (y + docsBoxH + footerBarHeight + 20 > pageHeight) {
        doc.addPage();
        y = 60;
      }

      // Fondo azul muy claro
      doc.setFillColor(239, 246, 255); // blue-50
      doc.setDrawColor(147, 197, 253); // blue-300
      doc.roundedRect(margin, y, pageWidth - (margin * 2), docsBoxH, 5, 5, 'FD');

      // Título azul bold
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235); // blue-600
      doc.text('DOCUMENTOS REQUERIDOS', margin + boxPadding, y + 20);

      // Bullet list dinámica
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 64, 175); // blue-800
      let docBulletY = y + 35;
      docItems.forEach(item => {
        doc.setFillColor(37, 99, 235);
        doc.circle(margin + boxPadding + 3, docBulletY - 3, 2, 'F');
        doc.text(item, margin + boxPadding + 10, docBulletY);
        docBulletY += lineSpacing;
      });

      y += docsBoxH + 15;
    }

    // --- NUEVO BLOQUE: CONFIRMACIÓN - PASAJEROS Y LIQUIDACIÓN FINANCIERA ---
    if (type === 'CONFIRMATION') {
      // 1. LISTA DE PASAJEROS
      if (opts.passengerRows && opts.passengerRows.length > 0) {
        if (y + 100 > pageHeight - footerBarHeight) { doc.addPage(); y = 60; }
        y = addSectionTitle('Información de Pasajeros y Alojamiento', y);

        autoTable(doc, {
          startY: y,
          head: [['No.', 'Nombres', 'Documento', 'Nacimiento', 'Acomodación']],
          body: opts.passengerRows.map((p, i) => [
            i + 1,
            p.fullName || '—',
            p.docId || '—',
            p.birthDate || '—',
            p.accommodation || '—'
          ]),
          headStyles: { fillColor: [30, 41, 59], textColor: COLORS.white, fontStyle: 'bold', fontSize: 9, halign: 'center' },
          bodyStyles: { textColor: COLORS.text, fontSize: 8 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { left: margin, right: margin },
          theme: 'grid',
          columnStyles: {
            0: { halign: 'center', cellWidth: 25 },
            2: { halign: 'center', cellWidth: 80 },
            3: { halign: 'center', cellWidth: 70 }
          }
        });
        y = doc.lastAutoTable.finalY + 20;

        if (opts.hotelName) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(30, 41, 59);
          doc.text(`Alojamiento en: ${opts.hotelName.toUpperCase()}`, margin, y);
          y += 15;
        }
      }

      // 2. LIQUIDACIÓN FINANCIERA
      if (opts.totalPrice) {
        if (y + 140 > pageHeight - footerBarHeight) { doc.addPage(); y = 60; }
        y = addSectionTitle('Liquidación de Pagos', y);

        const curr = opts.currency || 'USD';
        const tVal = parseFloat(opts.totalPrice) || 0;
        const deposit1 = parseFloat(opts.firstDeposit) || 0;
        const deposit2 = parseFloat(opts.secondDeposit) || 0;
        const balance = tVal - deposit1 - deposit2;

        const date1 = opts.depositDate ? opts.depositDate : '—';
        const date2 = opts.secondDepositDate ? opts.secondDepositDate : '—';
        const dateL = opts.dueDate ? opts.dueDate : '—';

        const fmtPrice = (v) => `$${v.toFixed(2)} ${curr}`;

        autoTable(doc, {
          startY: y,
          head: [['Concepto', 'Fecha Pago', `Valor (${curr})`]],
          body: [
            ['VALOR TOTAL DEL PLAN', '—', fmtPrice(tVal)],
            ['PRIMER ABONO (Liq. TRM del día)', date1, fmtPrice(deposit1)],
            ['SEGUNDO ABONO (Liq. TRM del día)', date2, fmtPrice(deposit2)],
            ['SALDO TOTAL', `Límite: ${dateL}`, fmtPrice(balance > 0 ? balance : 0)]
          ],
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129], textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { fontStyle: 'bold' },
            1: { halign: 'center' },
            2: { halign: 'right', fontStyle: 'bold' }
          },
          didParseCell: (data) => {
            if (data.row.index === 3) {
              data.cell.styles.fillColor = [254, 240, 138];
              data.cell.styles.textColor = [0, 0, 0];
            }
          },
          margin: { left: margin, right: margin }
        });
        y = doc.lastAutoTable.finalY + 25;
      }
    }


    // --- 3. CONDICIONES GENERALES (Redesigned) ---
    const rawConditions = opts.generalConditions || 'No se han especificado condiciones generales.';
    const condItems = rawConditions.split('\n').map(l => l.trim()).filter(Boolean);

    // Calculate height dynamically considering text wrapping
    let totalCondHeight = 30 + 20; // Title (30) + Bottom Padding (20)
    const condLineSpacing = 10;

    // Pre-calculate height
    condItems.forEach(item => {
      const textWidth = pageWidth - (margin * 2) - 40;
      const splitItem = doc.splitTextToSize(item, textWidth);
      totalCondHeight += (splitItem.length * 10) + 5; // 10 per line + 5 gap
    });

    if (y + totalCondHeight + footerBarHeight + 20 > pageHeight) {
      doc.addPage();
      y = 60;
    }

    // Slate Theme
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(margin, y, pageWidth - (margin * 2), totalCondHeight, 5, 5, 'FD');

    // Title
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('CONDICIONES GENERALES Y NOTAS LEGALES', margin + 15, y + 20);

    // Bullets
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85); // slate-700

    let currentCondY = y + 35;
    condItems.forEach(item => {
      const isHeader = item.endsWith(':');
      const hasBullet = item.startsWith('•');
      const cleanItem = hasBullet ? item.substring(1).trim() : item;

      if (!isHeader) {
        doc.setFillColor(100, 116, 139); // slate-500
        doc.circle(margin + 18, currentCondY - 3, 2, 'F');
      }

      if (isHeader) doc.setFont('helvetica', 'bold');
      else doc.setFont('helvetica', 'normal');

      const textWidth = pageWidth - (margin * 2) - 40;
      const splitItem = doc.splitTextToSize(cleanItem, textWidth);
      doc.text(splitItem, margin + (isHeader ? 15 : 25), currentCondY);

      currentCondY += (splitItem.length * 10) + 5;
    });

    y += totalCondHeight + 15;


    // --- 4. NOTA ACLARATORIA (Cierre Obligatorio) ---
    if (closingNote && closingNote.trim() !== '') {
      const closingNoteTitle = 'NOTA ACLARATORIA';
      const textIndent = 15;
      const textWidthClosing = pageWidth - (margin * 2) - textIndent;

      // Calculate height for closing note
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      const splitClosing = doc.splitTextToSize(closingNote, textWidthClosing);
      const closingHeight = 25 + (splitClosing.length * 12);

      // --- ANCLA AL FONDO (Pegado al pie de página azul) ---
      const bottomAnchorY = pageHeight - 30 - closingHeight - 10;

      if (y > bottomAnchorY) {
        doc.addPage();
        y = bottomAnchorY;
      } else {
        y = bottomAnchorY;
      }

      const noteStartY = y;

      // Vertical Accent Line (Blue)
      doc.setFillColor(...COLORS.secondary);
      doc.rect(margin, noteStartY, 3, closingHeight, 'F');

      // Render Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.accent);
      doc.text(closingNoteTitle, margin + textIndent, y + 10);
      y += 25;

      // Render Body with selective bolding for "Destinos P&P"
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.lightText);

      splitClosing.forEach(line => {
        if (y > pageHeight - footerBarHeight - 20) {
          doc.addPage();
          y = 60;
        }

        const currentX = margin + textIndent;
        if (line.includes('Destinos P&P')) {
          const parts = line.split('Destinos P&P');
          let runningX = currentX;
          parts.forEach((part, i) => {
            doc.setFont('helvetica', 'italic');
            doc.text(part, runningX, y);
            runningX += doc.getTextWidth(part);

            if (i < parts.length - 1) {
              doc.setFont('helvetica', 'bolditalic');
              doc.text('Destinos P&P', runningX, y);
              runningX += doc.getTextWidth('Destinos P&P');
            }
          });
        } else {
          doc.text(line, currentX, y);
        }
        y += 12;
      });
    }

    // FINAL FOOTER (Stays at the bottom of the page)
    const fY = pageHeight - 30;
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, fY, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);

    const aName = opts.advisorName || '';
    const aRole = opts.advisorRole || '';
    const advisorLabel = aName
      ? `${aName}${aRole ? ` (${aRole})` : ''}`
      : 'ASESOR NO REGISTRADO';
    doc.text(
      `Generado por ${advisorLabel} · ${brandName} | ${new Date().getFullYear()}`,
      pageWidth / 2,
      fY + 18,
      { align: 'center' }
    );

    // Save
    // Save
    const fName = `${folio || 'COTIZACION'}.pdf`;
    doc.save(fName);

  } catch (error) {

    alert('Ocurrió un error al generar el PDF.');
  }
}

// --- Wrappers ---

// --- Monthly Report Generator ---
export async function generateMonthlyReportPdf(opts) {
  try {
    const { month, year, quotes = [], totalSales, avgTicket, conversion, advisor } = opts || {};

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = 40;

    // --- Data Processing for Charts ---
    const advisorSales = {};
    const stepCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    quotes.forEach(q => {
      const adv = (q.advisor || 'Sin Asignar').split(' ')[0]; // Use first name for chart space
      const val = parseFloat(q.data?.salePrice || q.data?.totalCharged || 0) || 0;
      advisorSales[adv] = (advisorSales[adv] || 0) + val;

      const d = q.data || {};
      let step = 1;
      if (d.voucherGenerated) step = 5;
      else if (d.lockedBilling) step = 4;
      else if (d.supports && d.supports.length > 0) step = 3;
      else if (d.serviceConfirmed || q.status === 'confirmed') step = 2;

      for (let i = 1; i <= step; i++) stepCounts[i]++;
    });

    const advisorList = Object.entries(advisorSales).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxSale = Math.max(...advisorList.map(a => a[1]), 100);

    // --- 1. HEADER ---
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, 0, pageWidth, 80, 'F');
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 80, pageWidth, 5, 'F');

    const logoDestinos = await loadImage(LOGO_DESTINOS);
    if (logoDestinos) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, 15, 100, 50, 5, 5, 'F');
      doc.addImage(logoDestinos.dataUrl, 'PNG', margin + 5, 20, 90, 40);
    }

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE EJECUTIVO DE VENTAS', pageWidth - margin, 45, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(...COLORS.accent);
    doc.text(`CIERRE MENSUAL: ${month.toUpperCase()} ${year}`, pageWidth - margin, 60, { align: 'right' });

    y = 120;

    // --- 2. SUMMARY METRICS ---
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 70, 8, 8, 'FD');

    const colWidth = (pageWidth - (margin * 2)) / 3;
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.lightText);
    doc.text('TOTAL FACTURADO (USD)', margin + 20, y + 25);
    doc.text('TICKET PROMEDIO', margin + colWidth + 20, y + 25);
    doc.text('CONVERSIÓN GLOBAL', margin + (colWidth * 2) + 20, y + 25);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text(`$ ${parseFloat(totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, margin + 20, y + 50);
    doc.text(`$ ${parseFloat(avgTicket || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, margin + colWidth + 20, y + 50);
    doc.text(`${parseFloat(conversion || 0).toFixed(1)}%`, margin + (colWidth * 2) + 20, y + 50);

    y += 90; // Move y down after metrics

    // --- 3. VISION & PUBLICITY BLOCK ---
    doc.setFillColor(59, 130, 246, 0.05);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 45, 5, 5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.primary);
    const promoText = "En Destinos P&P, transformamos cada cotización en una experiencia memorable. Nuestro compromiso con la excelencia y el acompañamiento integral nos posiciona como líderes en el sector turístico regional.";
    doc.text(promoText, pageWidth / 2, y + 25, { align: 'center', maxWidth: pageWidth - (margin * 3) });

    y += 70; // Move y down after vision

    // --- 4. CHARTS SECTION ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text('ANÁLISIS DE DESEMPEÑO COMERCIAL', margin, y);
    y += 20;

    // --- Chart 1: Sales per Advisor ---
    const chartWidth = (pageWidth - (margin * 2) - 40) / 2;
    const chartHeight = 150;

    // Background Advisor Chart
    doc.setFillColor(252, 254, 255);
    doc.roundedRect(margin, y, chartWidth, chartHeight, 5, 5, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.secondary);
    doc.text('Ventas por Asesora (Top 5)', margin + 10, y + 20);

    let barX = margin + 30;
    const barW = (chartWidth - 60) / 5;
    advisorList.forEach(([name, val]) => {
      const bh = (val / maxSale) * (chartHeight - 60);
      doc.setFillColor(59, 130, 246); // Blue 500
      doc.rect(barX, y + chartHeight - 30 - bh, barW - 5, bh, 'F');

      doc.setFontSize(7);
      doc.setTextColor(...COLORS.lightText);
      doc.text(name, barX + (barW / 2) - 2.5, y + chartHeight - 15, { align: 'center', angle: -30 });

      doc.setFontSize(6);
      doc.text(`$${Math.round(val / 1000)}k`, barX + (barW / 2) - 2.5, y + chartHeight - 35 - bh, { align: 'center' });
      barX += barW;
    });

    // --- Chart 2: Conversion Funnel ---
    const funnelX = margin + chartWidth + 40;
    doc.setFillColor(252, 254, 255);
    doc.roundedRect(funnelX, y, chartWidth, chartHeight, 5, 5, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.secondary);
    doc.text('Embudo de Conversión (Pasos)', funnelX + 10, y + 20);

    const funnelSteps = ['Cotiz.', 'Conf.', 'Pagos', 'Fact.', 'Vouch.'];
    const maxSteps = stepCounts[1] || 1;
    let stepY = y + 45;
    funnelSteps.forEach((label, i) => {
      const count = stepCounts[i + 1];
      const fw = (count / maxSteps) * (chartWidth - 80);
      const fx = funnelX + (chartWidth / 2) - (fw / 2);

      const fillCol = i === 4 ? [16, 185, 129] : [59, 130, 246];
      doc.setFillColor(...fillCol);
      doc.rect(fx, stepY, fw, 15, 'F');

      doc.setFontSize(7);
      doc.setTextColor(...COLORS.lightText);
      doc.text(label, funnelX + 10, stepY + 10);
      doc.text(count.toString(), funnelX + chartWidth - 10, stepY + 10, { align: 'right' });
      stepY += 22;
    });

    y += chartHeight + 40;

    // --- 4. DATA TABLE ---
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.primary);
    doc.text('Detalle de Operaciones de este Periodo', margin, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Folio', 'Fecha', 'Cliente', 'Asesor', 'Destino', 'Valor USD']],
      body: quotes.slice(0, 50).map(q => [
        q.id,
        q.date,
        q.client,
        q.advisor,
        q.data?.destination || 'N/A',
        `$ ${parseFloat(q.data?.salePrice || q.data?.totalCharged || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      ]),
      headStyles: { fillColor: COLORS.secondary, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin }
    });

    y = doc.lastAutoTable.finalY + 40;

    // --- 5. FOOTER ---
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.lightText);
    doc.text(`Reporte generado por ${advisor} para Gerencia. Destinos P&P S.A.S.`, margin, y);
    doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, margin, y + 15);

    const fName = `Reporte_Ejecutivo_${month.toLowerCase()}_${year}.pdf`;
    doc.save(fName);

  } catch (error) {

    alert('Error al generar el reporte ejecutivo.');
  }
}

// --- Specialized Quinceañeras PDF Generator (Indistinguishable Luxury Style) ---
export async function generateQuincePdf(opts) {
  try {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = 30;

    const BLUE_COLOR = [30, 58, 138];
    const EMERALD_COLOR = [16, 185, 129];
    const LIGHT_GRAY = [248, 250, 252];
    const YELLOW_TOTAL = [234, 179, 8];

    // 1. Header: Logo (Left), Folio (Center Blue Box), Date/TRM (Right)
    doc.setFillColor(...BLUE_COLOR);
    doc.rect(0, 0, pageWidth, 60, 'F');
    doc.setFillColor(...EMERALD_COLOR);
    doc.rect(0, 60, pageWidth, 5, 'F');

    // Logo Destinos (Left Box - Refined Padding)
    const logoDestinos = await loadImage(LOGO_DESTINOS);
    if (logoDestinos) {
      const boxW = 90, boxH = 48, boxY = 6;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, boxY, boxW, boxH, 8, 8, 'F');

      const imgWidth = logoDestinos.width || 100;
      const imgHeight = logoDestinos.height || 50;
      const padding = 12;
      const maxWidth = boxW - padding;
      const maxHeight = boxH - padding;
      const imgRatio = imgWidth / imgHeight;
      const boxRatio = maxWidth / maxHeight;

      let dWidth, dHeight;
      if (imgRatio >= boxRatio) {
        dWidth = maxWidth;
        dHeight = dWidth / imgRatio;
      } else {
        dHeight = maxHeight;
        dWidth = dHeight * imgRatio;
      }

      doc.addImage(logoDestinos.dataUrl, 'PNG', margin + (boxW - dWidth) / 2, boxY + (boxH - dHeight) / 2, dWidth, dHeight);
    }

    // Folio Box (Center)
    const folioBoxW = 160, folioBoxH = 35;
    const folioBoxX = (pageWidth / 2) - (folioBoxW / 2);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.roundedRect(folioBoxX, 12, folioBoxW, folioBoxH, 20, 20, 'S');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(opts.folio || 'COT-VAC-2026-XXXX', pageWidth / 2, 33, { align: 'center' });

    // Date (Right)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`EMISIÓN: ${new Date().toLocaleDateString()}`, pageWidth - margin, 35, { align: 'right' });

    y = 90;

    // 2. Title & Large Photo (Molde 1 Continued)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE_COLOR);
    doc.text('COTIZACIÓN ESPECIAL QUINCEAÑERAS', pageWidth / 2, y, { align: 'center' });
    y += 20;

    if (opts.mainPhoto) {
      const banner = await loadImage(opts.mainPhoto);
      if (banner) {
        const banW = pageWidth - (margin * 2);
        const banH = 280;
        doc.addImage(banner.dataUrl, 'JPEG', margin, y, banW, banH, undefined, 'FAST');
        y += banH + 30;
      }
    }

    // 3. Info Box Unificado (Molde 2)
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 60, 8, 8, 'FD');

    const colW = (pageWidth - (margin * 2)) / 4;
    const labels = ['FECHA SUGERIDA', 'DESTINO', 'PASAJEROS', 'ACOMODACIÓN'];
    const values = [
      opts.suggestedDates || 'POR DEFINIR',
      String(opts.destination || 'VARIOS').toUpperCase(),
      `${(parseInt(opts.adults) || 1) + (parseInt(opts.children) || 0) + (parseInt(opts.infants) || 0)} VIAJERAS`,
      String(opts.planType || 'MÚLTIPLE').toUpperCase()
    ];

    labels.forEach((label, i) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(label, margin + (colW * i) + 20, y + 20);
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(values[i], margin + (colW * i) + 20, y + 40);
    });

    y += 90;

    // 5. Itinerario en Tabla (Molde 3)
    if (opts.itineraryTable && opts.itineraryTable.length > 0) {
      if (y > pageHeight - 100) { doc.addPage(); y = 60; }
      doc.setFontSize(14);
      doc.setTextColor(...BLUE_COLOR);
      doc.text('ITINERARIO EXPERIENCIAL DÍA A DÍA', margin, y);
      doc.setDrawColor(...BLUE_COLOR);
      doc.setLineWidth(1.5);
      doc.line(margin, y + 5, margin + 250, y + 5);
      y += 20;

      autoTable(doc, {
        startY: y,
        head: [['DÍA', 'ACTIVIDAD / CIUDAD', 'DESCRIPCIÓN DE LA EXPERIENCIA']],
        body: opts.itineraryTable.map((row, i) => [
          i + 1,
          String(row.city || '').toUpperCase(),
          row.description || ''
        ]),
        headStyles: { fillColor: BLUE_COLOR, fontSize: 10, halign: 'center' },
        bodyStyles: { fontSize: 9, cellPadding: 8 },
        columnStyles: { 0: { cellWidth: 40, halign: 'center' }, 1: { cellWidth: 120, fontStyle: 'bold' } },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: margin, right: margin },
        theme: 'grid'
      });
      y = doc.lastAutoTable.finalY + 30;
    }

    // 6. Alojamiento en Tabla (Molde 3 Continued)
    if (opts.hotels && opts.hotels.length > 0) {
      if (y > pageHeight - 150) { doc.addPage(); y = 60; }
      doc.setFontSize(14);
      doc.setTextColor(...BLUE_COLOR);
      doc.text('OPCIONES DE ALOJAMIENTO Y HOSPEDAJE', margin, y);
      doc.line(margin, y + 5, margin + 280, y + 5);
      y += 20;

      autoTable(doc, {
        startY: y,
        head: [['OPCIÓN', 'CIUDAD', 'HOTEL SELECCIONADO', 'PLAN DE ALIMENTACIÓN']],
        body: opts.hotels.map((h, i) => [
          `OPCIÓN ${i + 1}`,
          h.city || opts.destination || 'PENDIENTE',
          String(h.name || 'POR CONFIRMAR').toUpperCase(),
          h.room || 'PAQUETE COMPLETO'
        ]),
        headStyles: { fillColor: EMERALD_COLOR, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        margin: { left: margin, right: margin },
        theme: 'grid'
      });
      y = doc.lastAutoTable.finalY + 40;
    }

    // 7. Includes/Excludes
    if (y > pageHeight - 200) { doc.addPage(); y = 60; }
    doc.setFontSize(14);
    doc.setTextColor(...BLUE_COLOR);
    doc.text('INCLUSIONES Y NO INCLUIDOS', margin, y);
    doc.line(margin, y + 5, margin + 200, y + 5);
    y += 30;

    const splitW = (pageWidth - (margin * 2) - 40) / 2;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...EMERALD_COLOR);
    doc.text('EL PROGRAMA INCLUYE:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    const inclL = doc.splitTextToSize(opts.includes || 'Detalles no especificados.', splitW);
    doc.text(inclL, margin, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text('EL PROGRAMA NO INCLUYE:', margin + splitW + 40, y);
    doc.setFont('helvetica', 'normal');
    const exclL = doc.splitTextToSize(opts.excludes || 'Gastos personales.', splitW);
    doc.text(exclL, margin + splitW + 40, y + 15);

    y += Math.max(inclL.length, exclL.length) * 12 + 50;

    // 8. Liquidación Financiera (Molde 4)
    if (y > pageHeight - 150) { doc.addPage(); y = 60; }
    doc.setFontSize(14);
    doc.setTextColor(...BLUE_COLOR);
    doc.text('INVERSIÓN Y LIQUIDACIÓN PREVENTIVA', margin, y);
    doc.line(margin, y + 5, margin + 250, y + 5);
    y += 25;

    const hPrice = opts.hotels?.[0]?.pricing || {};
    const baseVal = parseFloat(hPrice.adultAffiliateRate) || 0;
    const taxes = parseFloat(hPrice.childRate) || 0;
    const total = baseVal + taxes;
    const curr = opts.currency || 'USD';

    autoTable(doc, {
      startY: y,
      body: [
        ['VALOR BASE PROGRAMA POR PERSONA', `${curr} $ ${baseVal.toLocaleString()}`],
        ['IMPUESTOS, TASAS Y CONTRIBUCIONES', `${curr} $ ${taxes.toLocaleString()}`],
        ['VALOR TOTAL ORIENTATIVO DEL PLAN', `${curr} $ ${total.toLocaleString()}`]
      ],
      columnStyles: { 0: { cellWidth: 320, fontStyle: 'bold' }, 1: { halign: 'right', fontStyle: 'bold', fontSize: 12 } },
      styles: { cellPadding: 12, fontSize: 10, textColor: [15, 23, 42], lineWidth: 1, drawColor: [203, 213, 225] },
      didParseCell: function (data) {
        if (data.row.index === 2) {
          data.cell.styles.fillColor = YELLOW_TOTAL;
          data.cell.styles.fontSize = 14;
        }
      },
      margin: { left: margin, right: margin },
      theme: 'grid'
    });

    y = doc.lastAutoTable.finalY + 40;

    // 9. Cláusulas Legales en Tarjetas (Molde 4 Continued)
    const cardGap = 15;
    const cardW = pageWidth - (margin * 2);

    const renderLegalCard = (title, content, color) => {
      const splitTxt = doc.splitTextToSize(content || '', cardW - 30);
      const cardH = 35 + (splitTxt.length * 12);

      if (y + cardH > pageHeight - 80) { doc.addPage(); y = 60; }

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, cardW, cardH, 8, 8, 'FD');

      doc.setFillColor(...color);
      doc.rect(margin, y, 4, cardH, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(title.toUpperCase(), margin + 15, y + 20);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(splitTxt, margin + 15, y + 35);

      y += cardH + cardGap;
    };

    renderLegalCard('Observaciones Importantes', opts.observacionesImportantes, [220, 38, 38]);
    renderLegalCard('Documentos Requeridos', opts.documentsInfo, [37, 99, 235]);
    renderLegalCard('Condiciones Generales y Notas Legales', opts.generalConditions, [71, 85, 105]);

    // 10. Firma y Cierre
    if (y > pageHeight - 100) { doc.addPage(); y = 60; }
    y += 20;
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, margin + 180, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE_COLOR);
    doc.text(opts.advisorName || 'Asesor Comercial Destinos P&P', margin, y + 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(opts.advisorRole || 'Consultor de Viajes Especializados', margin, y + 27);

    doc.save(`${opts.folio || 'COTIZACION'}.pdf`);
  } catch (error) {

  }
}

export async function generateQuotePdf(opts) {
  if (opts.quoteType === 'quince') {
    return generateQuincePdf(opts);
  }
  return generateUniversalPdf('QUOTE', opts);
}

export async function generateConfirmationPdf(opts) {
  return generateUniversalPdf('CONFIRMATION', opts);
}

export async function generateVoucherPdf(opts) {
  return generateUniversalPdf('VOUCHER', opts);
}

// --- Specialized Event PDF Generator ---
export async function generateEventPdf(opts) {
  try {
    const {
      folio = '',
      clientName = '',
      location = '',
      date = '',
      optionTitle = '',
      images = [],
      services = [],
      accommodation = [],
      finance = {},
      totals = {},
      currency = 'COP',
      advisorName = '',
      advisorRole = '',
      closingNote = '',
      adultsAffiliate = 0,
      adultsNonAffiliate = 0,
      children = 0,
      infants = 0
    } = opts;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const footerBarHeight = 30;

    // --- 1. CABECERA PREMIUM ---
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, 0, pageWidth, 60, 'F');

    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 60, pageWidth, 5, 'F');

    const logo = await loadImage(LOGO_DESTINOS);
    const boxY = 15;
    const boxHeight = 55;
    const boxWidth = 90;
    const innerBoxPadding = 10;

    if (logo && logo.dataUrl) {
      const leftX = margin;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(leftX, boxY, boxWidth, boxHeight, 5, 5, 'F');

      const imgRatio = logo.width / logo.height;
      const boxRatio = (boxWidth - innerBoxPadding) / (boxHeight - innerBoxPadding);
      let dWidth, dHeight;
      if (imgRatio >= boxRatio) {
        dWidth = boxWidth - innerBoxPadding;
        dHeight = dWidth / imgRatio;
      } else {
        dHeight = boxHeight - innerBoxPadding;
        dWidth = dHeight * imgRatio;
      }
      doc.addImage(logo.dataUrl, 'PNG', leftX + (boxWidth - dWidth) / 2, boxY + (boxHeight - dHeight) / 2, dWidth, dHeight);
    }

    // Títulos y Folio Centrdao Premium
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13); // Tamaño moderado para evitar superposición
    doc.text('COTIZACIÓN DE EVENTOS CORPORATIVOS', (pageWidth / 2) - 30, 40, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.accent);
    doc.text('PROPUESTA Y ORDEN DE SERVICIOS', (pageWidth / 2) - 30, 52, { align: 'center' });

    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(pageWidth - margin - 130, 25, 130, 25, 3, 3, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(folio ? folio.toUpperCase() : 'COT-EVE-0001', pageWidth - margin - 65, 42, { align: 'center' });

    let y = 100;

    // --- 2. CUADRO DE INFORMACIÓN GENERAL ---
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 70, 5, 5, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE / EMPRESA', margin + 15, y + 20);
    doc.text('DESTINO', margin + 200, y + 20);
    doc.text('FECHA DEL EVENTO', margin + 350, y + 20);

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text((clientName || 'CLIENTE NO ESPECIFICADO').toUpperCase(), margin + 15, y + 35);
    doc.text((location || 'POR DEFINIR').toUpperCase(), margin + 200, y + 35);
    doc.text((date || 'FECHA POR CONFIRMAR').toUpperCase(), margin + 350, y + 35);

    const paxList = [];
    if (adultsAffiliate > 0) paxList.push(`${adultsAffiliate} Adulto(s) Afil.`);
    if (adultsNonAffiliate > 0) paxList.push(`${adultsNonAffiliate} Adulto(s) No Afil.`);
    if (children > 0) paxList.push(`${children} Niño(s)`);
    if (infants > 0) paxList.push(`${infants} Infante(s)`);
    const paxString = paxList.length > 0 ? paxList.join('  |  ') : 'Cantidad no especificada';

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PASAJEROS:', margin + 15, y + 55);
    doc.setFont('helvetica', 'normal');
    doc.text(paxString, margin + 75, y + 55);

    y += 90;

    // --- 3. GALERÍA DE IMÁGENES ---
    if (images && images.length > 0) {
      const imgWidth = (pageWidth - (margin * 2) - 10) / 3;
      const imgHeight = 100;
      let galleryX = margin;

      for (let i = 0; i < Math.min(images.length, 3); i++) {
        const img = await loadImage(images[i]);
        if (img) {
          doc.addImage(img.dataUrl, 'JPEG', galleryX, y, imgWidth, imgHeight, undefined, 'FAST');
          galleryX += imgWidth + 5;
        }
      }
      y += imgHeight + 20;
    }

    if (optionTitle) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.primary);
      doc.text(optionTitle.toUpperCase(), margin, y);
      doc.setDrawColor(...COLORS.primary);
      doc.line(margin, y + 5, margin + doc.getTextWidth(optionTitle.toUpperCase()), y + 5);
      y += 20;
    }

    // --- 4. TABLA DE SERVICIOS ---
    if (services && services.length > 0) {
      const serviceRows = services.map(s => [
        s.description,
        s.quantity,
        `$ ${Number(String(s.total).replace(/,/g, '')).toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: y,
        head: [['DESCRIPCIÓN DEL SERVICIO', 'CANTIDAD', `TOTAL (${currency})`]],
        body: serviceRows,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9, halign: 'center' },
        bodyStyles: { textColor: COLORS.text, fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 70, halign: 'center' },
          2: { cellWidth: 100, halign: 'right', fontStyle: 'bold' }
        }
      });
      y = doc.lastAutoTable.finalY + 20;
    }

    // --- 5. ALOJAMIENTO (OPCIONAL) ---
    if (accommodation && accommodation.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      doc.text('DETALLES DE ALOJAMIENTO / HABITACIONES', margin, y);
      y += 10;

      const roomRows = accommodation.map(r => [
        r.roomType,
        r.pax,
        `$ ${Number(String(r.total).replace(/,/g, '')).toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Tipo de Habitación', 'Pax', `Total (${currency})`]],
        body: roomRows,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: { fillColor: [100, 116, 139], textColor: COLORS.white, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          1: { halign: 'center', cellWidth: 50 },
          2: { halign: 'right', cellWidth: 100 }
        }
      });
      y = doc.lastAutoTable.finalY + 25;
    }

    // --- 6. RESUMEN FINANCIERO (CON RESALTADO AMARILLO) ---
    if (y + 160 > pageHeight - footerBarHeight) { doc.addPage(); y = 60; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text('LIQUIDACIÓN FINANCIERA', margin + 200, y);
    y += 10;

    const subtotalEventPlain = totals.subtotalEvent || 0;
    const ivaPlain = totals.ivaAmount || 0;
    const impoconsumoPlain = totals.impoconsumoAmount || 0;

    const summaryRows = [
      ['Sub Total Servicios', `$ ${Math.round(subtotalEventPlain - ivaPlain - impoconsumoPlain).toLocaleString()}`],
      [`IVA (${finance.ivaPercent}%)`, `$ ${Math.round(ivaPlain).toLocaleString()}`],
      [`Impoconsumo (${finance.impoconsumoPercent}%)`, `$ ${Math.round(impoconsumoPlain).toLocaleString()}`],
      ['Sub Total Evento', `$ ${Math.round(subtotalEventPlain).toLocaleString()}`],
      [`Fee Agencia (${finance.agencyFeePercent}%)`, `$ ${Math.round(totals.feeAmount || 0).toLocaleString()}`],
      [`IVA sobre Fee (${finance.feeIvaPercent}%)`, `$ ${Math.round(totals.feeIvaAmount || 0).toLocaleString()}`],
      ['TOTAL A PAGAR EVENTO', `$ ${Math.round(totals.totalEvent || 0).toLocaleString()}`]
    ];

    autoTable(doc, {
      startY: y,
      body: summaryRows,
      margin: { left: margin + 200, right: margin },
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 5 },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.row.index === 3) {
          data.cell.styles.fillColor = [226, 232, 240]; // slate-200
        }
        if (data.row.index === 6) {
          data.cell.styles.fillColor = [254, 240, 138]; // Yellow Resaltado Premium
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontSize = 10;
        }
      }
    });

    y = doc.lastAutoTable.finalY + 30;

    // --- 7. TARJETAS LEGALES Y NOTAS CONDICIONALES ---
    if (y + 100 > pageHeight - footerBarHeight) { doc.addPage(); y = 60; }

    // CONDICIONES COMERCIALES
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 65, 5, 5, 'FD');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('CONDICIONES COMERCIALES DE EVENTOS', margin + 15, y + 15);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('• Las tarifas presentadas son informativas y están sujetas a disponibilidad y cambios sin previo aviso.', margin + 15, y + 30);
    doc.text('• La confirmación final de los servicios requerirá el pago de los anticipos estipulados en el contrato adjunto.', margin + 15, y + 42);
    doc.text('• Cancelaciones y modificaciones se rigen bajo las políticas de penalidad de los proveedores involucrados.', margin + 15, y + 54);
    y += 80;

    // HABEAS DATA
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 50, 5, 5, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES (HABEAS DATA)', margin + 15, y + 15);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('En cumplimiento de la Ley 1581 de 2012, Destinos P&P informa que sus datos personales serán tratados con estrictas', margin + 15, y + 28);
    doc.text('políticas de seguridad, confidencialidad y manejo conforme a las finalidades exclusivas del servicio turístico ofertado.', margin + 15, y + 40);
    y += 65;

    // --- FOOTER & SIGNATURE ---
    const bottomY = pageHeight - footerBarHeight - 50;
    if (y > bottomY) { doc.addPage(); y = 60; }

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(advisorName.toUpperCase() || 'EQUIPO DE EVENTOS Y CORPORATIVO', margin, bottomY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(advisorRole || 'ASESOR COMERCIAL', margin, bottomY + 12);
    doc.text('DESTINOS P&P - EXPERTOS EN EXPERIENCIAS CORPORATIVAS', margin, bottomY + 24);

    // Fondo barra inferior
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, pageHeight - footerBarHeight, pageWidth, footerBarHeight, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.white);
    doc.text('Destinos P&P - Todos los derechos reservados | Eventos y Grupos Corporativos', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // --- REGLA DE NOMBRADO DE ARCHIVO ---
    const filename = `${folio || 'COTIZACION'}.pdf`;

    doc.save(filename);
    return true;

  } catch (error) {

    throw error;
  }
}

export async function generateAccommodationPdf(opts) {
  try {
    const { folio, options, currency, advisorName, advisorRole, clientName } = opts;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const footerBarHeight = 30;

    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const totals = option.totals;

      if (i > 0) doc.addPage();

      let y = 60;

      // --- 1. CABECERA PREMIUM (MOLDE 1) ---
      doc.setFillColor(...COLORS.secondary);
      doc.rect(0, 0, pageWidth, 60, 'F');
      doc.setFillColor(...COLORS.primary);
      doc.rect(0, 60, pageWidth, 5, 'F');

      const logo = await loadImage(LOGO_DESTINOS);
      const boxY = 15;
      const boxHeight = 55;
      const boxWidth = 90;
      const innerBoxPadding = 10;

      if (logo && logo.dataUrl) {
        const leftX = margin;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(leftX, boxY, boxWidth, boxHeight, 5, 5, 'F');

        const imgRatio = logo.width / logo.height;
        const boxRatio = (boxWidth - innerBoxPadding) / (boxHeight - innerBoxPadding);
        let dWidth, dHeight;
        if (imgRatio >= boxRatio) {
          dWidth = boxWidth - innerBoxPadding;
          dHeight = dWidth / imgRatio;
        } else {
          dHeight = boxHeight - innerBoxPadding;
          dWidth = dHeight * imgRatio;
        }
        doc.addImage(logo.dataUrl, 'PNG', leftX + (boxWidth - dWidth) / 2, boxY + (boxHeight - dHeight) / 2, dWidth, dHeight);
      }

      // Títulos y Folio Centrado Premium
      doc.setTextColor(...COLORS.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13); // Ligeramente más pequeño
      doc.text('COTIZACIÓN DE ALOJAMIENTO', (pageWidth / 2) - 30, 40, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.accent);
      doc.text('PROPUESTA DE SERVICIOS TURÍSTICOS', (pageWidth / 2) - 30, 52, { align: 'center' });

      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(pageWidth - margin - 130, 25, 130, 25, 3, 3, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(folio ? folio.toUpperCase() : 'COT-ALO-0001', pageWidth - margin - 65, 42, { align: 'center' });

      y = 100;

      // --- 2. CUADRO DE INFORMACIÓN GENERAL (MOLDE 2) ---
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 60, 5, 5, 'FD');

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.text('CLIENTE', margin + 15, y + 20);
      doc.text('DESTINO', margin + 200, y + 20);
      doc.text('OPCIÓN', margin + 350, y + 20);

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text((clientName || 'CLIENTE DESTINOS P&P').toUpperCase(), margin + 15, y + 35);
      doc.text((opts.destination || option.location || 'POR DEFINIR').toUpperCase(), margin + 200, y + 35);

      const hotelName = option.hotelName || 'HOTEL NO ESPECIFICADO';
      const maxHotelWidth = pageWidth - margin - (margin + 350) - 5; // Respetar margen derecho
      const hotelString = doc.splitTextToSize(`OPCIÓN ${i + 1}: ${hotelName}`.toUpperCase(), maxHotelWidth);
      doc.text(hotelString, margin + 350, y + 35);

      y += 80;

      // --- 3. GALERÍA DE IMÁGENES ---
      if (option.images && option.images.length > 0) {
        const imgWidth = (pageWidth - (margin * 2) - 10) / 3;
        const imgHeight = 100;
        let galleryX = margin;

        for (let j = 0; j < Math.min(option.images.length, 3); j++) {
          const img = await loadImage(option.images[j]);
          if (img) {
            doc.addImage(img.dataUrl, 'JPEG', galleryX, y, imgWidth, imgHeight, undefined, 'FAST');
            galleryX += imgWidth + 5;
          }
        }
        y += imgHeight + 20;
      }

      // --- 4. TABLA DE NOCHES (MOLDE 3) ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.primary);
      doc.text('PLAN DE ALOJAMIENTO / ITINERARIO', margin, y);
      doc.setDrawColor(...COLORS.primary);
      doc.line(margin, y + 5, margin + 250, y + 5);
      y += 20;

      const tableRows = option.nights.map((n, nIdx) => [
        `Noche ${nIdx + 1}`,
        n.date,
        n.description,
        n.pax,
        `$ ${Number(String(n.total).replace(/,/g, '')).toLocaleString()}`
      ]);

      if (option.checkoutDate) {
        tableRows.push([
          'Salida',
          option.checkoutDate,
          '',
          '',
          'SALIDA'
        ]);
      }

      autoTable(doc, {
        startY: y,
        head: [['ÍTEM', 'FECHA', 'DESCRIPCIÓN', 'PAX', `TOTAL (${currency})`]],
        body: tableRows,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9, halign: 'center' },
        bodyStyles: { textColor: COLORS.text, fontSize: 8, valign: 'middle' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 60, halign: 'center' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 30, halign: 'center' },
          4: { cellWidth: 70, halign: 'right', fontStyle: 'bold' }
        }
      });

      y = doc.lastAutoTable.finalY + 20;

      // --- 5. RESUMEN FINANCIERO (MOLDE 4 - Resaltado Amarillo) ---
      if (y + 160 > pageHeight - footerBarHeight) { doc.addPage(); y = 60; }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      doc.text('LIQUIDACIÓN FINANCIERA', margin + 200, y);
      y += 10;

      const summaryRows = [
        ['Sub Total Alojamiento', `$ ${Math.round(totals.subtotalAlojamiento).toLocaleString()}`]
      ];

      if (totals.feeBase > 0 || totals.feeTaxAlo > 0 || totals.feeIva > 0) {
        summaryRows.push([`Fee Agencia`, `$ ${Math.round(totals.feeBase).toLocaleString()}`]);
        if (totals.feeTaxAlo > 0) summaryRows.push(['Impuesto Alojamiento', `$ ${Math.round(totals.feeTaxAlo).toLocaleString()}`]);
        summaryRows.push([`IVA sobre Fee (19%)`, `$ ${Math.round(totals.feeIva).toLocaleString()}`]);
      }

      summaryRows.push(['TOTAL A PAGAR', `$ ${Math.round(totals.totalAPagar).toLocaleString()}`]);

      autoTable(doc, {
        startY: y,
        body: summaryRows,
        margin: { left: margin + 200, right: margin },
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 5 },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold', fillColor: [248, 250, 252] },
          1: { halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
          if (data.row.index === summaryRows.length - 1) {
            data.cell.styles.fillColor = [254, 240, 138]; // Yellow Resaltado Premium
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontSize = 10;
          } else if (data.row.index === 0) {
            data.cell.styles.fillColor = [226, 232, 240]; // slate-200
          }
        }
      });

      y = doc.lastAutoTable.finalY + 30;

      // --- 6. NOTAS Y OBSERVACIONES ---
      if (option.notes) {
        if (y + 60 > pageHeight - footerBarHeight) { doc.addPage(); y = 60; }

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin, y, pageWidth - (margin * 2), 65, 5, 5, 'FD');
        doc.setFillColor(...COLORS.primary);
        doc.rect(margin, y, 4, 65, 'F'); // Acento de color

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text('OBSERVACIONES DE ESTA OPCIÓN:', margin + 15, y + 15);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);

        const splitNotes = doc.splitTextToSize(option.notes, pageWidth - (margin * 2) - 20);
        doc.text(splitNotes, margin + 15, y + 28);
        y += 80;
      }

      // --- 7. TARJETAS LEGALES Y CONDICIONALES ---
      if (i === options.length - 1) {
        if (y + 100 > pageHeight - footerBarHeight) { doc.addPage(); y = 60; }

        // CONDICIONES COMERCIALES
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin, y, pageWidth - (margin * 2), 65, 5, 5, 'FD');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('CONDICIONES COMERCIALES DE ALOJAMIENTO', margin + 15, y + 15);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('• Las tarifas presentadas son informativas y están sujetas a disponibilidad y cambios sin previo aviso.', margin + 15, y + 30);
        doc.text('• La confirmación final de los servicios requerirá el pago de los anticipos estipulados en la factura.', margin + 15, y + 42);
        doc.text('• Cancelaciones y modificaciones se rigen bajo las políticas de penalidad del proveedor hotelero.', margin + 15, y + 54);
        y += 80;

        // HABEAS DATA
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin, y, pageWidth - (margin * 2), 50, 5, 5, 'FD');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES (HABEAS DATA)', margin + 15, y + 15);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('En cumplimiento de la Ley 1581 de 2012, Destinos P&P informa que sus datos personales serán tratados con estrictas', margin + 15, y + 28);
        doc.text('políticas de seguridad, confidencialidad y manejo conforme a las finalidades exclusivas del servicio turístico ofertado.', margin + 15, y + 40);
      }

      // --- FOOTER & SIGNATURE ---
      const bottomY = pageHeight - footerBarHeight - 50;
      if (y > bottomY) { doc.addPage(); y = 60; }

      if (i === options.length - 1) {
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.text);
        doc.setFont('helvetica', 'bold');
        doc.text(advisorName?.toUpperCase() || 'EQUIPO DE ASESORÍA', margin, bottomY);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(advisorRole || 'ASESOR COMERCIAL Y TURISMO', margin, bottomY + 12);
        doc.text('DESTINOS P&P - TU AGENCIA IDEAL', margin, bottomY + 24);
      }

      // Fondo barra inferior
      doc.setFillColor(...COLORS.secondary);
      doc.rect(0, pageHeight - footerBarHeight, pageWidth, footerBarHeight, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.white);
      doc.text(`Destinos P&P - Todos los derechos reservados | Folio: ${folio || 'COT'} - Opc. ${i + 1}/${options.length}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`${folio || 'COTIZACION'}.pdf`);
    return true;
  } catch (error) {

    throw error;
  }
}

// --- Vacaciones a tu Medida PDF Generator ---
export async function generateVacacionesMedidaPdf(opts) {
  try {
    const {
      folio, beneficiary, tripInfo, itinerary, settlements,
      currency, advisorName, advisorRole
    } = opts;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const colors = {
      blue: [0, 114, 206], // Institutional Blue
      yellow: [255, 235, 59], // Yellow for Totals
      slate: [30, 41, 59],
      lightSlate: [241, 245, 249]
    };

    // --- 1. HEADER (Institucional) ---
    doc.setFillColor(...colors.blue);
    doc.rect(0, 0, pageWidth, 5, 'F');

    const logo = await loadImage(LOGO_DESTINOS);
    if (logo) {
      doc.addImage(logo.dataUrl, 'PNG', pageWidth - margin - 80, 20, 70, 70);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...colors.slate);
    doc.text("VACACIONES A TU MEDIDA", margin, 50);

    doc.setFontSize(10);
    doc.setTextColor(...colors.blue);
    doc.text(`FOLIO: ${folio}`, margin, 70);

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Fecha de creación: ${new Date().toLocaleDateString()}`, margin, 85);

    let y = 110;

    // --- 2. IDENTIFICACIÓN DEL BENEFICIARIO ---
    autoTable(doc, {
      startY: y,
      head: [['IDENTIFICACIÓN DEL BENEFICIARIO']],
      body: [
        [`EMPLEADO: ${beneficiary.employeeName.toUpperCase()}`],
        [`EMPRESA: ${beneficiary.company.toUpperCase()}`],
        [`CONVENIO: ${beneficiary.agreement.toUpperCase()}`]
      ],
      theme: 'plain',
      headStyles: { fillColor: colors.blue, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' },
      styles: { cellPadding: 5, fontSize: 9, textColor: colors.slate },
      margin: { left: margin, right: margin }
    });
    y = doc.lastAutoTable.finalY + 20;

    // --- 3. INFORMACIÓN DEL VIAJE & FOTO ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...colors.blue);
    doc.text("INFORMACIÓN GENERAL", margin, y);
    y += 10;

    if (tripInfo.mainPhoto) {
      const img = await loadImage(tripInfo.mainPhoto);
      if (img) {
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = 200;
        doc.addImage(img.dataUrl, 'JPEG', margin, y, imgWidth, imgHeight, undefined, 'FAST');
        y += imgHeight + 15;
      }
    }

    autoTable(doc, {
      startY: y,
      body: [
        ['DESTINO', tripInfo.destination.toUpperCase()],
        ['PASAJEROS', tripInfo.passengers.toUpperCase()],
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold', width: 100, fillColor: [245, 245, 245] } },
      margin: { left: margin, right: margin }
    });
    y = doc.lastAutoTable.finalY + 20;

    // --- 4. ITINERARIO AÉREO ---
    if (itinerary.air.length > 0 && itinerary.air[0].route) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...colors.blue);
      doc.text("ITINERARIO AÉREO", margin, y);
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['FECHA', 'AEROLÍNEA', 'RUTA', 'SALIDA', 'LLEGADA']],
        body: itinerary.air.map(a => [
          a.date.toUpperCase(),
          a.airline.toUpperCase(),
          a.route.toUpperCase(),
          a.departure.toUpperCase(),
          a.arrival.toUpperCase()
        ]),
        theme: 'grid',
        headStyles: { fillColor: colors.blue, textColor: [255, 255, 255], fontSize: 8, halign: 'center' },
        styles: { fontSize: 8, halign: 'center' },
        margin: { left: margin, right: margin }
      });
      y = doc.lastAutoTable.finalY + 20;
    }

    // --- 5. OPCIONES DE ALOJAMIENTO ---
    if (tripInfo.accommodationOptions && tripInfo.accommodationOptions.length > 0 && tripInfo.accommodationOptions[0].hotel) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...colors.blue);
      doc.text("OPCIONES DE ALOJAMIENTO", margin, y);
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['OPCIONES', 'CIUDADES', 'HOTEL', 'ALIMENTACIÓN']],
        body: tripInfo.accommodationOptions.map((opt, idx) => [
          `OPCIÓN ${idx + 1}`,
          opt.city.toUpperCase(),
          opt.hotel.toUpperCase(),
          opt.meals.toUpperCase()
        ]),
        theme: 'grid',
        headStyles: { fillColor: colors.blue, textColor: [255, 255, 255], fontSize: 8, halign: 'center' },
        styles: { fontSize: 8, halign: 'center', cellPadding: 6 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
        margin: { left: margin, right: margin }
      });
      y = doc.lastAutoTable.finalY + 20;
    }

    // --- 6. LIQUIDACIONES ---
    settlements.forEach((s, idx) => {
      // Título de la tabla de liquidación
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(183, 28, 28); // Rojo institucional para títulos de liquidación

      const title = s.title.toUpperCase();
      const titleHeight = 20;

      if (y > pageHeight - 150) {
        doc.addPage();
        y = 40;
      }

      doc.text(title, margin, y + 15);
      doc.line(margin, y + 18, margin + doc.getTextWidth(title), y + 18);
      y += 25;

      autoTable(doc, {
        startY: y,
        head: [['CONCEPTO DE LIQUIDACIÓN', 'VALOR']],
        body: [
          ['VALOR TOTAL DEL PLAN', `${currency} $${parseFloat(s.totalValue).toLocaleString()}`],
          [`DESCUENTO DE LA AGENCIA (${s.agencyDiscountPercent}%)`, `$ ${s.calculations.agencyDiscountValue.toLocaleString()}`],
          [`VALOR SUBSIDIADO POR EMPRESA (${s.companySubsidyPercent}%)`, `$ ${s.calculations.companySubsidyValue.toLocaleString()}`],
          ['VALOR A DESCONTAR AL FUNCIONARIO', `$ ${s.calculations.employeeDeduction.toLocaleString()}`],
          ['VALOR PAGAR DE EMPRESA A LA AGENCIA', `$ ${s.calculations.companyPayToAgency.toLocaleString()}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: colors.blue, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: 'bold', width: pageWidth * 0.6 },
          1: { halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
          if (data.row.index === 0) {
            data.cell.styles.fillColor = [0, 114, 206];
            data.cell.styles.textColor = [255, 255, 255];
          }
          if (data.row.index === 3) {
            data.cell.styles.fillColor = [255, 235, 59]; // Amarillo Planillas
            data.cell.styles.textColor = [0, 0, 0];
          }
        },
        margin: { left: margin, right: margin }
      });
      y = doc.lastAutoTable.finalY + 35;
    });

    // --- 6. FOOTER / SIGNATURE ---
    const footerY = pageHeight - 100;
    doc.setDrawColor(...colors.blue);
    doc.line(margin, footerY, 200, footerY);
    doc.setFontSize(9);
    doc.setTextColor(...colors.slate);
    doc.text(advisorName.toUpperCase(), margin, footerY + 15);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(advisorRole, margin, footerY + 28);
    doc.text("ASESOR COMERCIAL", margin, footerY + 40);

    const filename = `${folio || 'COTIZACION'}.pdf`;
    doc.save(filename);
    return true;

  } catch (error) {

    throw error;
  }
}
