import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

console.log('PDF Utils module loaded');

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
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          resolve({ dataUrl, width, height });
        };
        img.onerror = reject;
        img.src = dataUrl;
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Error loading image for PDF:', url, error);
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
      clientEmail,
      clientPhone,
      destination,
      adults = 0,
      children = 0,
      dateStart,
      dateEnd,
      duration,
      hotels = [],
      includes = [],
      notes = '',
      flights = [],
      flightRows = [],
      luggage = { personal: true, hand: true, checked: false },
      corporateBrand,
      currency = 'USD', // Added currency
      advisorName,    // Added advisorName
      advisorRole     // Added advisorRole
    } = opts || {};

    // 1. Determine Branding & Titles
    const isCorporate = !!corporateBrand;
    const logoUrl = isCorporate && corporateBrand.logo ? corporateBrand.logo : LOGO_DESTINOS;
    const brandName = isCorporate && corporateBrand.name ? corporateBrand.name : 'Destinos P&P';

    let title = 'DOCUMENTO DE VIAJE';
    let subTitle = 'DETALLES DEL SERVICIO';

    if (type === 'QUOTE') {
      title = 'COTIZACIÓN DE SERVICIOS';
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

    // --- Header ---
    // Background Header Strip
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, 0, pageWidth, 60, 'F'); // Dark top bar

    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 60, pageWidth, 5, 'F'); // Green accent line

    // Logo Handling (New Structural Change)
    let currentLogoX = margin;
    const boxY = 15;
    const boxHeight = 65;
    const boxWidth = 120;

    // Always Draw Destinos P&P Logo
    if (logoDestinos && logoDestinos.dataUrl) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(currentLogoX, boxY, boxWidth, boxHeight, 5, 5, 'F');

      const imgWidth = logoDestinos.width || boxWidth;
      const imgHeight = logoDestinos.height || boxHeight;
      const maxWidth = boxWidth - 15;
      const maxHeight = boxHeight - 15;
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

      doc.addImage(logoDestinos.dataUrl, 'PNG', currentLogoX + (boxWidth - dWidth) / 2, boxY + (boxHeight - dHeight) / 2, dWidth, dHeight);
      currentLogoX += boxWidth + 10;
    }

    // Draw Corporate Logo ONLY for Corporate Module
    if (isCorporate && logoCorporate && logoCorporate.dataUrl) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(currentLogoX, boxY, boxWidth, boxHeight, 5, 5, 'F');

      const imgWidth = logoCorporate.width || boxWidth;
      const imgHeight = logoCorporate.height || boxHeight;
      const maxWidth = boxWidth - 15;
      const maxHeight = boxHeight - 15;
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

      doc.addImage(logoCorporate.dataUrl, 'PNG', currentLogoX + (boxWidth - dWidth) / 2, boxY + (boxHeight - dHeight) / 2, dWidth, dHeight);
    }

    // Document Title (Right aligned)
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(title, pageWidth - margin, 40, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.accent);
    doc.text(subTitle, pageWidth - margin, 52, { align: 'right' });

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

    // Left Column: Client
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(clientName || '—', margin, y + 15);
    if (clientEmail) doc.text(clientEmail, margin, y + 30);
    if (clientPhone) doc.text(clientPhone, margin, y + 45);

    // Right Column: Destination & Dates
    const rightCol = pageWidth / 2 + 20;
    doc.setFont('helvetica', 'bold');
    doc.text('DESTINO Y FECHAS:', rightCol, y);
    doc.setFont('helvetica', 'normal');

    // For cruise, we might have destination in cruiseData
    const dest = destination || (opts.cruiseData ? opts.cruiseData.destination : '—');
    doc.text(dest, rightCol, y + 15);

    if (dateStart && dateEnd) {
      const start = new Date(dateStart);
      const end = new Date(dateEnd);
      doc.text(`${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, rightCol, y + 30);

      // Calculate nights
      const ms = end.getTime() - start.getTime();
      const nights = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
      const durationText = duration ? duration : `${nights} Noche${nights !== 1 ? 's' : ''}`;
      doc.text(durationText, rightCol, y + 45);
    } else if (duration) {
      doc.text(duration, rightCol, y + 45);
    } else if (opts.cruiseData && opts.cruiseData.plan) {
      doc.text(`Plan: ${opts.cruiseData.plan}`, rightCol, y + 30);
    }

    // Pax info
    const paxAdults = adults || (opts.cruiseData ? parseInt(opts.cruiseData.passengers) || 0 : 0);
    if (paxAdults || children) {
      const pax = [];
      if (paxAdults) pax.push(`${paxAdults} Adulto${paxAdults > 1 ? 's' : ''}`);
      if (children) pax.push(`${children} Niño${children > 1 ? 's' : ''}`);
      doc.text(`Pasajeros: ${pax.join(', ')}`, rightCol, y + 60);
    }

    y += 85;

    // --- Cruise Header Info (Plan & Accommodation) ---
    if (opts.cruiseData) {
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.roundedRect(margin, y - 10, pageWidth - (margin * 2), 40, 5, 5, 'FD');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.secondary);
      doc.text('DETALLES DEL CRUCERO:', margin + 15, y + 15);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      const cruiseInfo = [];
      if (opts.cruiseData.plan) cruiseInfo.push(`Plan: ${opts.cruiseData.plan}`);
      if (opts.cruiseData.accommodation) cruiseInfo.push(`Acomodación: ${opts.cruiseData.accommodation}`);
      doc.text(cruiseInfo.join('  |  '), margin + 150, y + 15);
      y += 45;
    }

    // --- Luggage Section (Global or First Option) ---
    const globalLuggage = opts.luggage || { personal: true, hand: true, checked: false };
    const luggageList = [];
    if (globalLuggage.personal) luggageList.push('Artículo Personal');
    if (globalLuggage.hand) luggageList.push('Equipaje de Mano (10kg)');
    if (globalLuggage.checked) luggageList.push('Equipaje de Bodega (23kg)');

    // Only show this global luggage box if we are NOT in multi-option mode (flightOptions)
    // or if we just want to show a default. Let's hide it if flightOptions exists, 
    // as each option has its own luggage.
    const hasFlightOptions = opts.flightOptions && opts.flightOptions.length > 0;

    if (!hasFlightOptions && luggageList.length > 0) {
      doc.setFillColor(240, 253, 244); // Light green bg
      doc.setDrawColor(187, 247, 208); // Green border
      doc.roundedRect(margin, y - 10, pageWidth - (margin * 2), 35, 5, 5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.primary);
      doc.text('EQUIPAJE INCLUIDO:', margin + 15, y + 12);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      doc.text(luggageList.join('  •  '), margin + 130, y + 12);

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
            head: [['Aerolínea', 'Vuelo', 'Ruta', 'Horario', 'Equipo']],
            body: option.flights.map(f => [
              f.airline || '—',
              f.flight || '—',
              f.route || '—',
              `${f.departure || ''} - ${f.arrival || ''}`.trim() || '—',
              f.equipment || f.aircraft || '—'
            ]),
            headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { textColor: COLORS.text, fontSize: 8 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: margin, right: margin },
            theme: 'grid'
          });
          y = doc.lastAutoTable.finalY + 20;
        }
      }
      y += 10;
    }
    else {
      const allFlights = [...(flights || []), ...(flightRows || [])];
      if (allFlights.length > 0) {
        y = addSectionTitle('Itinerario Aéreo', y);

        const isConfirmation = type === 'CONFIRMATION' || type === 'VOUCHER';

        if (isConfirmation) {
          autoTable(doc, {
            startY: y,
            head: [['IDENTIFICACIÓN', 'PASAJERO', 'ITINERARIO', `FINANCIERO (${currency})`]],
            body: allFlights.map(f => [
              `${f.airline || '—'}\nTK: ${f.eticket || '—'}\nPNR: ${f.pnr || '—'}`,
              `${f.passengerName || '—'}\nDOC: ${f.passengerId || '—'}`,
              `${f.route || '—'}\nFECHA: ${f.flightDate || '—'}\nHORA: ${f.depTime || '—'} > ${f.arrTime || '—'}`,
              `${currency === 'COP' ? '$ ' : '$ '}${parseFloat(f.valueUsd || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            ]),
            headStyles: { fillColor: [30, 64, 175], textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 }, // Indigo 800
            bodyStyles: { textColor: COLORS.text, fontSize: 8, cellPadding: 8 },
            alternateRowStyles: { fillColor: [240, 249, 255] }, // Light blue
            margin: { left: margin, right: margin },
            theme: 'grid'
          });
        } else {
          autoTable(doc, {
            startY: y,
            head: [['Aerolínea', 'Vuelo', 'Ruta', 'Horario', 'Equipo']],
            body: allFlights.map(f => [
              f.airline || '—',
              f.flight || '—',
              f.route || (f.departure ? `${f.departure} > ${f.arrival}` : '—'),
              f.time || f.duration || '—',
              f.class || f.equipment || '—'
            ]),
            headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white, fontStyle: 'bold' },
            bodyStyles: { textColor: COLORS.text },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            margin: { left: margin, right: margin }
          });
        }

        y = doc.lastAutoTable.finalY + 30;
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

    // 2. Hotels
    if (hotels && hotels.length > 0) {
      y = addSectionTitle('Alojamiento', y);

      autoTable(doc, {
        startY: y,
        head: [['Hotel', 'Noches', 'Tipo Habitación', 'Régimen/Notas']],
        body: hotels.map(h => {
          let n = '';
          if (dateStart && dateEnd) {
            const s = new Date(dateStart);
            const e = new Date(dateEnd);
            n = Math.round((e - s) / (86400000));
          }
          return [
            h.name || '—',
            n || '—',
            h.room || '—',
            h.notes || h.regimen || h.mealPlan || '—'
          ];
        }),
        headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
        bodyStyles: { textColor: COLORS.text },
        alternateRowStyles: { fillColor: [236, 253, 245] },
        margin: { left: margin, right: margin }
      });

      y = doc.lastAutoTable.finalY + 30;
    }

    // 2.5. Ground Logistics
    if (opts.groundLogistics && (opts.groundLogistics.meetPoint || opts.groundLogistics.meetDate || opts.groundLogistics.operator)) {
      if (y > pageHeight - 150) {
        doc.addPage();
        y = 60;
      }
      y = addSectionTitle('Logística de Transporte', y);

      autoTable(doc, {
        startY: y,
        head: [['Punto de Encuentro', 'Fecha', 'Hora', 'Operador / Vehículo']],
        body: [[
          opts.groundLogistics.meetPoint || '—',
          opts.groundLogistics.meetDate || '—',
          opts.groundLogistics.meetTime || '—',
          opts.groundLogistics.operator || '—'
        ]],
        headStyles: { fillColor: [45, 212, 191], textColor: COLORS.white, fontStyle: 'bold' },
        bodyStyles: { textColor: COLORS.text },
        margin: { left: margin, right: margin },
        theme: 'grid'
      });
      y = doc.lastAutoTable.finalY + 30;
    }

    // 3. Includes
    const includesList = Array.isArray(includes) ? includes.filter(Boolean) : [];
    if (includesList.length > 0) {
      if (y > pageHeight - 120) {
        doc.addPage();
        y = 60;
      }
      y = addSectionTitle('El Plan Incluye', y);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);

      includesList.forEach(item => {
        if (y > pageHeight - 60) {
          doc.addPage();
          y = 60;
        }
        doc.setFillColor(...COLORS.primary);
        doc.circle(margin + 5, y - 3, 2, 'F');
        doc.text(item, margin + 15, y);
        y += 14;
      });
      y += 20;
    }

    // --- Footer / Notes / Closure ---

    // PRE-CALCULATION FOR BETTER PAGE BREAKS
    const lineHeight = 14;
    const padding = 20;
    let notesHeight = 0;
    let splitCustomNotes = [];

    if (notes) {
      doc.setFontSize(9);
      splitCustomNotes = doc.splitTextToSize(notes, pageWidth - (margin * 2) - 40);
      notesHeight = splitCustomNotes.length * (lineHeight - 2);
    }

    const redBoxHeight = 30 + (3 * lineHeight) + notesHeight + (padding * 2);
    const gridHeight = 110 + 20; // 110 boxes + 20 gap
    const footerBarHeight = 30;
    const buffer = 40;

    // Si no cabe todo el bloque de cierre (Caja roja + Grid + Barra final), saltamos
    if (y + redBoxHeight + gridHeight + footerBarHeight + buffer > pageHeight) {
      doc.addPage();
      y = 60;
    }

    // Separador visual
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    // --- 1. OBSERVACIONES IMPORTANTES (Red Box) ---
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(252, 165, 165);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), redBoxHeight, 5, 5, 'FD');

    let currentY = y + padding + 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('OBSERVACIONES IMPORTANTES', pageWidth / 2, currentY, { align: 'center' }); // Centrado el título

    currentY += 20;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(153, 27, 27);

    const obsText = [
      '• Aplica penalidad por cambios y cancelaciones.',
      '• Después de emitido el tiquete todo cambio genera penalidad.',
      '• Los reembolsos solo aplican si las condiciones de la tarifa lo permiten.'
    ];

    obsText.forEach(line => {
      doc.text(line, margin + 25, currentY);
      currentY += lineHeight;
    });

    if (splitCustomNotes.length > 0) {
      currentY += 5;
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(51, 65, 85);
      doc.text(splitCustomNotes, margin + 25, currentY);
    }

    y += redBoxHeight + 20;

    // --- 2. GRID: CONDICIONES & DOCUMENTOS ---
    if (y + gridHeight + footerBarHeight + 20 > pageHeight) {
      doc.addPage();
      y = 60;
    }

    const colWidth = (pageWidth - (margin * 2) - 15) / 2;
    const boxH = 110;

    // Left Box: CONDICIONES GENERALES
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, colWidth, boxH, 5, 5, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text('CONDICIONES GENERALES', margin + 15, y + 20);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('FORMA DE PAGO', margin + 15, y + 35);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    const paymentConds = [
      `Pago en ${currency === 'COP' ? 'pesos colombianos (COP)' : 'dólares americanos (USD)'}`,
      'Transferencia Bancaria / QR / PSE',
      'Tarjeta de crédito (+3% fee administrativo)'
    ];
    let condY = y + 45;
    paymentConds.forEach(line => {
      doc.circle(margin + 18, condY - 2.5, 1, 'F');
      doc.text(line, margin + 25, condY);
      condY += 10;
    });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('RESTRICCIONES', margin + 15, condY + 5);

    doc.setFont('helvetica', 'normal');
    const restrictConds = [
      'Anulación genera gastos del 100% una vez pagado',
      'Servicios no tomados no son reembolsables'
    ];
    condY += 15;
    restrictConds.forEach(line => {
      doc.circle(margin + 18, condY - 2.5, 1, 'F');
      doc.text(line, margin + 25, condY);
      condY += 10;
    });

    // Right Box: DOCUMENTOS REQUERIDOS
    const rBoxX = margin + colWidth + 15;
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(rBoxX, y, colWidth, boxH, 5, 5, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('DOCUMENTOS REQUERIDOS', rBoxX + 15, y + 20);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    const docsList = [
      'Cédula de ciudadanía original',
      'Pasaporte vigente (Solo vuelos internacionales)',
      'Visas o permisos de ingreso (si aplica)'
    ];

    let dY = y + 40;
    docsList.forEach(line => {
      doc.setFillColor(59, 130, 246);
      doc.circle(rBoxX + 18, dY - 2.5, 1.5, 'F');
      doc.text(line, rBoxX + 25, dY);
      dY += 12;
    });

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
    const fName = `${type.toLowerCase()}_${folio || 'borrador'}.pdf`;
    doc.save(fName);

  } catch (error) {
    console.error('Error generating PDF:', error);
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
    const margin = 40;
    let y = 40;

    // Header
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

    // Summary Metrics Grid
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 70, 5, 5, 'FD');

    const colWidth = (pageWidth - (margin * 2)) / 3;

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.lightText);
    doc.text('TOTAL FACTURADO (USD)', margin + 20, y + 25);
    doc.text('TICKET PROMEDIO', margin + colWidth + 20, y + 25);
    doc.text('CONVERSIÓN', margin + (colWidth * 2) + 20, y + 25);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text(`$ ${parseFloat(totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, margin + 20, y + 50);
    doc.text(`$ ${parseFloat(avgTicket || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, margin + colWidth + 20, y + 50);
    doc.text(`${parseFloat(conversion || 0).toFixed(1)}%`, margin + (colWidth * 2) + 20, y + 50);

    y += 100;

    // Detail Table
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.primary);
    doc.text('Detalle de Operaciones Confirmadas', margin, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Folio', 'Fecha', 'Cliente', 'Asesor', 'Destino', 'Valor USD']],
      body: quotes.map(q => [
        q.id,
        q.date,
        q.client,
        q.advisor,
        q.data?.destination || 'N/A',
        `$ ${parseFloat(q.data?.salePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      ]),
      headStyles: { fillColor: COLORS.secondary, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin }
    });

    y = doc.lastAutoTable.finalY + 40;

    // Footer/Closure
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.lightText);
    doc.text(`Reporte emitido el ${new Date().toLocaleString()} por ${advisor}`, margin, y);

    const fName = `cierre_${month.toLowerCase()}_${year}.pdf`;
    doc.save(fName);

  } catch (error) {
    console.error('Error generating Monthly Report:', error);
    alert('Error al generar el reporte de cierre.');
  }
}

export async function generateQuotePdf(opts) {
  return generateUniversalPdf('QUOTE', opts);
}

export async function generateConfirmationPdf(opts) {
  return generateUniversalPdf('CONFIRMATION', opts);
}

export async function generateVoucherPdf(opts) {
  return generateUniversalPdf('VOUCHER', opts);
}
