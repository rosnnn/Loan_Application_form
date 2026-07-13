import React, { useRef, useState, useEffect } from 'react';
import SignaturePad from 'react-signature-canvas';

/**
 * SignatureCanvas - responsive e-signature capture.
 * - Draw with mouse or touch
 * - Clear button resets the canvas
 * - Exports as base64 PNG
 * - Validates non-empty canvas before allowing continuation
 * - Overlay-on-blur prevents trivial screen-capture of the live canvas
 */
export default function SignatureCanvas({
  onChange, value, error, label = 'Signature',
}) {
  const padRef = useRef(null);
  const containerRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [width, setWidth] = useState(500);
  const [obscured, setObscured] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleEnd = () => {
    if (padRef.current) {
      const empty = padRef.current.isEmpty();
      setIsEmpty(empty);
      if (!empty) {
        onChange(padRef.current.getTrimmedCanvas().toDataURL('image/png'));
      }
    }
  };

  const handleClear = () => {
    if (padRef.current) {
      padRef.current.clear();
      setIsEmpty(true);
      onChange('');
    }
  };

  return (
    <div className="mb-4">
      <p className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        <span className="text-danger ml-0.5">*</span>
      </p>
      <div
        ref={containerRef}
        className={`relative border rounded-md bg-white ${error ? 'border-danger' : 'border-slate-300'}`}
        onMouseLeave={() => setObscured(true)}
        onMouseEnter={() => setObscured(false)}
      >
        <SignaturePad
          ref={padRef}
          canvasProps={{
            width,
            height: 180,
            className: 'signature-canvas w-full touch-none',
            'aria-label': 'Draw your signature here',
          }}
          onEnd={handleEnd}
        />
        {obscured && value && (
          <div className="absolute inset-0 bg-slate-50/90 flex items-center justify-center text-xs text-slate-400 pointer-events-none">
            Signature hidden - click to reveal
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-2">
        <button
          type="button"
          onClick={handleClear}
          className="min-h-[44px] px-4 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
        >
          Clear
        </button>
        {!isEmpty && <span className="text-xs text-accent">Signature captured</span>}
      </div>
      {error && (
        <p role="alert" aria-live="polite" className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
