import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchResolutionById } from 'store/slices/resolutionsSlice';
import { withBase } from 'utils/baseUrl';
import './print-resolution.css';
import { fixUtf8Mojibake } from 'utils/encodingFix';

export default function PrintResolutionPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: resolution, loading } = useSelector((s) => s.resolutions);

  useEffect(() => {
    if (id) dispatch(fetchResolutionById(id));
  }, [dispatch, id]);

  // Set the __printReady flag when resolution is loaded and content is ready
  useEffect(() => {
    if (resolution && !loading) {
      // Small delay to ensure DOM is updated with the resolution content
      const timer = setTimeout(() => {
        window.__printReady = true;
        console.log('PrintResolutionPage: __printReady flag set');
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Reset flag when loading or no resolution
      window.__printReady = false;
    }
  }, [resolution, loading]);

  // Handle PDF download using browser's print functionality
  const handleDownloadPdf = () => {
    window.print();
  };

  if (!resolution) {
    return <div>Cargando...</div>;
  }

  // resolved logo URL (used for both left and temporary right image)
  const logoUrl = withBase('/static/fiuni.png');
  const uniURL = withBase('/static/uni.png');
  if (typeof window !== 'undefined') console.log('PrintResolutionPage: logoUrl=', logoUrl);

  // Format place and issued date like: "Encarnación, 25 de Agosto/2025"
  function formatPlaceDate(isoOrTs) {
    if (!isoOrTs) return '';
    const d = new Date(isoOrTs);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate();
    const year = d.getFullYear();
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const monthName = months[d.getMonth()];
    return `Encarnación, ${day} de ${monthName}/${year}`;
  }

  return (
    <>
      {/* Floating download button - hidden when printing */}
      <div className="download-button-container no-print">
        <button 
          onClick={handleDownloadPdf}
          className="download-pdf-btn"
          title="Descargar como PDF"
        >
          📄 Descargar PDF
        </button>
      </div>

      <div className="print-page">
        <header className="print-header">
          <div className="header-left">
            {/* Left logo (primary) */}
            <img
              src={uniURL}
              alt="Escudo UNI"
              className="print-logo"
              onError={(e) => {
                console.error('PrintResolutionPage: failed to load left logo:', uniURL, e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div className="header-center">
            <div className="header-title">Universidad Nacional de Itapúa - UNI</div>
            <div className="header-subtitle">
              <div> Creada por Ley N° 1.009/96 del 03/12/96</div>
              <div><strong>Facultad de Ingeniería</strong></div>
              <div>Abg. Lorenzo Zacarias Nº 255 c/ Ruta 1 Km. 2,5 – Campus Universitario UNI –Encarnación –   Paraguay</div>
            </div>
          </div>

          <div className="header-right">
            {/* Right logo (temporary uses same logoUrl) */}
            <img
              src={logoUrl}
              alt="Escudo FIUNI"
              className="print-logo print-logo-right"
              onError={(e) => {
                console.error('PrintResolutionPage: failed to load right logo:', logoUrl, e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </header>
        
        {/* Place and formatted date line */}
        <div className="resolution-place-date">{formatPlaceDate(resolution.issuedDate)}</div>

        {/* Resolution heading: right aligned, italic and underlined */}
        {(() => {
          const d = resolution.issuedDate ? new Date(resolution.issuedDate) : null;
          const year = d && !isNaN(d.getTime()) ? d.getFullYear() : new Date().getFullYear();
          const num = resolution.number || '—';
          const prefix = resolution.resolvedByDean ? 'RESOLUCIÓN Dec. N°' : 'RESOLUCIÓN C.D. N°';
          return (
            <div className="resolution-heading-right">
              {`${prefix} ${num}/${year}`}
            </div>
          );
        })()}

        <main className="print-body" dangerouslySetInnerHTML={{ __html: fixUtf8Mojibake(resolution.content) }} />

        {/* Directivas - Sign off section: two signatures side by side */}
        <section className="signoff-section">
          <div className="signoff-column">
            <div className="signoff-line" />
            <div className="signoff-name">Lic. Esa Gonzalez T.</div>
            <div className="signoff-role">Secretaria General</div>
          </div>
          <div className="signoff-column">
            <div className="signoff-line" />
            <div className="signoff-name">Ing. Oscar D. Trochez V.</div>
            <div className="signoff-role">Decano</div>
          </div>
        </section>

        {/* <footer className="print-footer">
          <div>Resuelto por: {resolution.resolvedByDean ? 'Decano' : 'Consejo Directivo'}</div>
          <div>Expediente: {resolution.recordSummary?.number || 'N/A'}</div>
        </footer> */}
      </div>
    </>
  );
}
