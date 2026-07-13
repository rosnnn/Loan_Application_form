# Architecture

## 1. Wizard Pattern

`src/components/Wizard.jsx` holds a `STEP_REGISTRY`: an ordered array of
`{ number, name, component }` objects. The Wizard is responsible for:

- Computing which steps are **visible** given the current form state (Step 6,
  Co-Applicant, is filtered out unless `isCoApplicantStepActive()` returns true
  for the current loan type/amount).
- Rendering the active step's component and passing it `onNext`, `onPrevious`,
  `onSaveDraft`, and `goToStep`.
- Moving DOM focus to the first input of the new step on every transition
  (WCAG 2.4.3 Focus Order).
- Wiring `useAutoSave` (fires on every form-state change, debounced to a
  30-second interval) and `useFormPersistence` (checks LocalStorage on mount
  and offers a Resume/Start Fresh modal).

Each step is its **own** `useForm()` instance (Pattern 2 from the brief:
Step-Per-Form, Shared Context) rather than one giant 50+ field form. This
keeps each step's validation local and fast, while a `FormDataContext`
(`src/context/FormDataContext.jsx`) holds the accumulated data across all
completed steps - the "shared context" half of the pattern. When a step's
`handleSubmit` succeeds, its data is merged into the shared context via
`updateFormData()`, and the Wizard advances.

## 2. Schema Factory & Cross-Step Dependencies

`src/schemas/schemaFactory.js` exports `getSchemaForStep(stepNumber, formState)`.
Steps whose validity depends on another step's data (Step 1's tenure depends on
Step 2's date of birth; Step 3's PAN entity-type restriction depends on Step 1's
loan type; Step 5's schema depends on Step 1's loan type) are implemented as
**functions that accept the aggregated `formState`** and return a schema built
with `.superRefine()`, rather than static schema objects. This mirrors exactly
the dependency map in the assignment's Section B3:

| Dependency | Implementation |
|---|---|
| Step 2 DOB -> Step 1 max tenure | `getStep1Schema(formState)` reads `formState.dateOfBirth` |
| Step 1 Loan Type -> Step 3 PAN entity restriction | `getStep3Schema(formState)` computes `allowedEntityChars` |
| Step 1 Loan Type -> Step 5 employment restriction | `getStep5Schema(formState)` rejects Salaried for Business loans |
| Step 1 Loan Type/Amount -> Step 6 visibility | `isCoApplicantStepActive()` in `constants/loanConfig.js`, read by the Wizard |
| Step 3 PAN verified -> Step 7 upload requirement | `getRequiredDocumentKeys()` in `Step7Documents.jsx` deletes `panCard` from the required set |
| Step 1/5/6 income -> Step 8 EMI ratio | `getMonthlyIncome()` + `calculateEmiToIncomeRatio()` in `Step8Review.jsx` |

Static, self-contained schemas (Step 2, Step 4, Step 6, Step 8) are plain Zod
objects with `.superRefine()` used only for same-step relationships (e.g. Step 4's
"rent amount required if Rented").

## 3. Auto-Save Flow

1. `useAutoSave(formState, loanType, interval)` runs in the Wizard, watching the
   full aggregated `formData` object.
2. On every change, its internal debounce timer (`useRef`) resets. When the
   timer fires (default 30s), it calls `encryptData()` (`utils/encryption.js`),
   which derives an AES-256-GCM key via PBKDF2 from a static passphrase, and
   encrypts the JSON-serialised form state with a random IV.
3. The encrypted `{ iv, data }` plus a `metadata` object (`{ version, timestamp,
   loanType }`) is written to `localStorage['lendswift_draft_<loanType>']`.
4. A toast ("Draft saved at HH:MM:SS") is shown for 2 seconds.
5. On mount, `useFormPersistence()` scans all three possible draft keys. A
   draft is only offered if its `metadata.version` matches the current
   `SCHEMA_VERSION` and it is less than 72 hours old (`AUTO_SAVE_TTL_HOURS`);
   otherwise it is silently deleted (handles both corruption and schema
   migrations, per Section A1.5/C3.4).
6. The Wizard renders a Resume/Start Fresh modal before the form itself, if a
   valid draft is found. Resuming calls `updateFormData(draft.data)` and jumps
   to the saved step; Start Fresh (or a failed decrypt/parse) clears the key
   and starts from Step 1.
7. On successful final submission (`Step8Review.jsx`), the draft key for the
   current loan type is removed from LocalStorage.

## 4. Document & Signature Handling

- `FileUpload.jsx` wraps `react-dropzone`, validates type/size/count client-side,
  and - for image files only - runs `compressImage()` (`utils/imageCompression.js`)
  which draws the image onto an off-DOM `<canvas>`, resizes to a 1200px max
  width, and exports a JPEG blob at decreasing quality (0.7 -> 0.3) until it is
  under 2MB or quality bottoms out. PDFs pass through unmodified.
- `Step7Documents.jsx` computes the **required document set dynamically** from
  loan type + employment type + PAN verification status, and blocks
  progression until every required key has at least one uploaded file and a
  signature has been captured.
- `SignatureCanvas.jsx` wraps `react-signature-canvas`; `onEnd` exports a
  trimmed PNG data URL, which is what gets stored in the shared form context
  and displayed for review in Step 8.

## 5. Why These Specific Trade-offs

- **Context over Redux/Zustand:** the shared state is scoped to a single
  wizard instance with a shallow, well-known shape - Context avoids a
  dependency for a problem it already solves cleanly at this scale.
- **AES-256-GCM over a simpler XOR/base64 "obfuscation":** the brief explicitly
  requires encryption for PII (PAN, Aadhaar, income, address) at rest in
  LocalStorage; GCM additionally provides integrity (tamper detection doubles
  as the "corrupted draft" detection path in the QA stress test).
- **Per-step React Hook Form instances over one 50-field form:** isolates
  re-renders to the active step only, and keeps each step's Zod schema legible
  instead of one sprawling discriminated union.
