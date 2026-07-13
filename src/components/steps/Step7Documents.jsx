import React, {
  forwardRef, useMemo, useRef, useState,
} from 'react';
import { useFormData } from '../../context/FormDataContext';
import FileUpload from '../common/FileUpload';
import SignatureCanvasField from '../common/SignatureCanvas';
import StepNavigation from '../common/StepNavigation';
import {
  REQUIRED_DOCUMENTS, DOCUMENT_LABELS, LOAN_TYPE,
} from '../../constants/loanConfig';

function getRequiredDocumentKeys(formData) {
  const keys = new Set(REQUIRED_DOCUMENTS.common);
  if (formData.employmentType && REQUIRED_DOCUMENTS[formData.employmentType]) {
    REQUIRED_DOCUMENTS[formData.employmentType].forEach((k) => keys.add(k));
  }
  if (formData.loanType === LOAN_TYPE.HOME) {
    REQUIRED_DOCUMENTS[LOAN_TYPE.HOME].forEach((k) => keys.add(k));
  }
  if (formData.loanType === LOAN_TYPE.BUSINESS) {
    REQUIRED_DOCUMENTS[LOAN_TYPE.BUSINESS].forEach((k) => keys.add(k));
  }
  // Cross-step dependency: if PAN already verified in Step 3, PAN copy upload becomes optional
  if (formData.panVerified) keys.delete('panCard');
  return Array.from(keys);
}

const Step7Documents = forwardRef(({ onNext, onPrevious, onSaveDraft }, ref) => {
  const { formData, updateFormData } = useFormData();
  const [documents, setDocuments] = useState(formData.documents || {});
  const [signature, setSignature] = useState(formData.signature || '');
  const [error, setError] = useState('');
  const signatureRef = useRef(formData.signature || '');

  const readSignatureFromCanvas = (formEl) => {
    const canvas = formEl?.querySelector('canvas.signature-canvas');
    if (!canvas) return '';
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const { width, height } = canvas;
    const { data } = ctx.getImageData(0, 0, width, height);
    let hasInk = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) {
        hasInk = true;
        break;
      }
    }
    return hasInk ? canvas.toDataURL('image/png') : '';
  };

  const requiredKeys = useMemo(() => getRequiredDocumentKeys(formData), [formData]);
  const optionalPanNote = formData.panVerified;

  const handleFilesChange = (key, files) => {
    setDocuments((prev) => ({ ...prev, [key]: files }));
  };

  const handleSignatureChange = (value) => {
    signatureRef.current = value;
    setSignature(value);
    if (value) setError('');
  };

  const allDocsUploaded = requiredKeys.every((key) => (documents[key] || []).length > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    let latestSignature = signatureRef.current || signature;
    if (!latestSignature) {
      latestSignature = readSignatureFromCanvas(e.currentTarget);
      if (latestSignature) {
        signatureRef.current = latestSignature;
        setSignature(latestSignature);
      }
    }
    if (!allDocsUploaded) {
      setError('Please upload all required documents.');
      return;
    }
    if (!latestSignature) {
      setError('Please provide your e-signature.');
      return;
    }
    setError('');
    updateFormData({ documents, signature: latestSignature });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} noValidate ref={ref}>
      <h2 className="text-xl font-semibold text-primary mb-4">Document Upload & E-Signature</h2>

      {optionalPanNote && (
        <p className="text-xs text-accent mb-4">Your PAN was verified in Step 3, so uploading a PAN copy is optional.</p>
      )}

      <ul className="mb-4 space-y-1" aria-label="Document checklist">
        {requiredKeys.map((key) => (
          <li key={key} className="flex items-center gap-2 text-sm">
            <span className={(documents[key] || []).length > 0 ? 'text-accent' : 'text-slate-400'}>
              {(documents[key] || []).length > 0 ? '\u2713' : '\u25CB'}
            </span>
            {DOCUMENT_LABELS[key]}
          </li>
        ))}
      </ul>

      {requiredKeys.map((key) => (
        <FileUpload
          key={key}
          id={key}
          label={DOCUMENT_LABELS[key]}
          required
          files={documents[key] || []}
          onChange={(files) => handleFilesChange(key, files)}
        />
      ))}

      <SignatureCanvasField value={signature} onChange={handleSignatureChange} />

      {error && <p role="alert" aria-live="polite" className="text-sm text-danger mb-4">{error}</p>}

      <StepNavigation isLastStep={false} onPrevious={onPrevious} onSaveDraft={onSaveDraft} />
    </form>
  );
});
Step7Documents.displayName = 'Step7Documents';

export default Step7Documents;
