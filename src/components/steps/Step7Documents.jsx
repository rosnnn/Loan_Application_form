import React, { forwardRef, useMemo, useState } from 'react';
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

  const requiredKeys = useMemo(() => getRequiredDocumentKeys(formData), [formData]);
  const optionalPanNote = formData.panVerified;

  const handleFilesChange = (key, files) => {
    setDocuments((prev) => ({ ...prev, [key]: files }));
  };

  const allDocsUploaded = requiredKeys.every((key) => (documents[key] || []).length > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allDocsUploaded) {
      setError('Please upload all required documents.');
      return;
    }
    if (!signature) {
      setError('Please provide your e-signature.');
      return;
    }
    setError('');
    updateFormData({ documents, signature });
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

      <SignatureCanvasField value={signature} onChange={setSignature} />

      {error && <p role="alert" aria-live="polite" className="text-sm text-danger mb-4">{error}</p>}

      <StepNavigation isLastStep={false} onPrevious={onPrevious} onSaveDraft={onSaveDraft} />
    </form>
  );
});
Step7Documents.displayName = 'Step7Documents';

export default Step7Documents;
