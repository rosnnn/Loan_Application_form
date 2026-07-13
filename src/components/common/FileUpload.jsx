import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { compressImage } from '../../utils/imageCompression';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILES = 3;

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/**
 * FileUpload - drag-and-drop upload with:
 * - type validation (PDF, JPG, PNG)
 * - size validation (max 5MB, max 3 files)
 * - client-side image compression via Canvas API
 * - thumbnail preview for images, icon + filename for PDFs
 * - accepts a `renderPreview` render-prop for custom preview rendering
 */
export default function FileUpload({
  label, files = [], onChange, accept = ['application/pdf', 'image/jpeg', 'image/png'],
  maxFiles = MAX_FILES, renderPreview, required, error, id,
}) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    setUploadError(null);

    if (fileRejections.length > 0) {
      const first = fileRejections[0];
      if (first.errors[0]?.code === 'file-too-large') {
        setUploadError(`File exceeds ${MAX_FILE_SIZE_MB}MB limit`);
      } else if (first.errors[0]?.code === 'file-invalid-type') {
        setUploadError('Only PDF, JPG, and PNG files are accepted');
      } else {
        setUploadError('File could not be uploaded');
      }
      return;
    }

    if (files.length + acceptedFiles.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsCompressing(true);
    const processed = [];
    for (const file of acceptedFiles) {
      // eslint-disable-next-line no-await-in-loop
      const result = await compressImage(file);
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(result.file) : null;
      processed.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file: result.file,
        preview,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        wasCompressed: result.wasCompressed,
        type: file.type,
        name: file.name,
      });
    }
    setIsCompressing(false);
    onChange([...files, ...processed]);
  }, [files, maxFiles, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    maxFiles,
  });

  const removeFile = (fileId) => {
    onChange(files.filter((f) => f.id !== fileId));
  };

  return (
    <div className="mb-4">
      {label && (
        <p className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </p>
      )}
      <div
        {...getRootProps()}
        id={id}
        role="button"
        tabIndex={0}
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300'
        }`}
      >
        <input {...getInputProps()} aria-label={label} />
        <p className="text-sm text-slate-600">
          {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}
        </p>
        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG - max {MAX_FILE_SIZE_MB}MB</p>
      </div>

      <div aria-live="polite" className="sr-only">
        {isCompressing ? 'Compressing image, please wait' : ''}
      </div>

      {isCompressing && <p className="mt-2 text-xs text-slate-500">Compressing...</p>}
      {uploadError && <p role="alert" aria-live="polite" className="mt-1 text-sm text-danger">{uploadError}</p>}
      {error && <p role="alert" aria-live="polite" className="mt-1 text-sm text-danger">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 p-2 border border-slate-200 rounded-md">
              {renderPreview ? renderPreview(f) : (
                <>
                  {f.preview ? (
                    <img src={f.preview} alt={`Preview of ${f.name}`} className="h-10 w-10 object-cover rounded" />
                  ) : (
                    <span className="h-10 w-10 flex items-center justify-center bg-slate-100 rounded text-xs font-semibold text-slate-500">
                      PDF
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{f.name}</p>
                    <p className="text-xs text-slate-400">
                      {f.wasCompressed && f.compressedSize < f.originalSize
                        ? `${formatBytes(f.originalSize)} -> ${formatBytes(f.compressedSize)}`
                        : formatBytes(f.originalSize)}
                    </p>
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="text-sm text-danger min-h-[44px] min-w-[44px] px-2"
                aria-label={`Remove ${f.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
