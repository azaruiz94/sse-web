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
          {/* Use centralized helper so assets work when app is hosted under a base path (e.g., /free) */}
          {(() => {
            const logoUrl = withBase('/static/fiuni.png');
            // log resolved URL to help debug 404s or base-path issues
            if (typeof window !== 'undefined') console.log('PrintResolutionPage: logoUrl=', logoUrl);
            return (
              <img
                src={logoUrl}
                alt="Escudo FIUNI"
                className="print-logo"
                onError={(e) => {
                  // show clear console error and hide broken image
                  // eslint-disable-next-line no-console
                  console.error('PrintResolutionPage: failed to load logo:', logoUrl, e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            );
          })()}
          <div className="print-meta">
            <div><strong>Número:</strong> {resolution.number || '—'}</div>
            <div><strong>Fecha:</strong> {resolution.issuedDate ? new Date(resolution.issuedDate).toLocaleDateString() : '—'}</div>
          </div>
        </header>

  <main className="print-body" dangerouslySetInnerHTML={{ __html: fixUtf8Mojibake(resolution.content) }} />

        <footer className="print-footer">
          <div>Resuelto por: {resolution.resolvedByDean ? 'Decano' : 'Consejo Directivo'}</div>
          <div>Expediente: {resolution.recordSummary?.number || 'N/A'}</div>
        </footer>
      </div>
    </>
  );
}
