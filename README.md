# LendSwift - Multi-Step Loan Application Form

A production-grade, 8-step multi-step loan application form built for LendSwift, a
fictional Indian digital lending NBFC. Built as a Front-End Developer technical
assignment (Zetheta Algorithms - Complex Form Engineering / Validation Architecture
/ State Persistence).

Handles Personal, Home, and Business loans with divergent field requirements,
real-time and cross-step validation, simulated PAN/Aadhaar verification, PIN code
address autocomplete, encrypted auto-save with resume, client-side document
compression, e-signature capture, and a pre-approval (Key Fact Statement) summary.

## Tech Stack

- **React 19** + **Vite** - build tooling and dev server
- **React Hook Form** - uncontrolled-under-the-hood form state (avoids re-render
  cascades across 50+ fields)
- **Zod** (v3 API) - schema-based validation, including `.superRefine()` for
  cross-step dependencies
- **Tailwind CSS** - utility-first responsive styling, LendSwift brand theme
- **React Dropzone** - drag-and-drop file uploads
- **react-signature-canvas** - e-signature capture
- **Web Crypto API (AES-256-GCM)** - encrypts the auto-saved draft in LocalStorage
- **Cypress** + **cypress-axe** - end-to-end tests and accessibility audits
- **ESLint (Airbnb config)** - code quality

## Getting Started

```bash
npm install
npm run dev        # starts the dev server at http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Available Scripts

```bash
npm run dev        # start Vite dev server
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run lint       # ESLint (Airbnb config), zero errors required
npm run cy:open    # open the Cypress interactive test runner
npm run test:e2e   # starts the dev server AND runs the full Cypress suite headlessly
```

The first time you run `npm run test:e2e` or `npm run cy:open`, Cypress will
download its browser binary (needs network access to the Cypress CDN).

## Project Structure

```
src/
  components/
    common/         # reusable, accessible form primitives (Input, Select,
                     # RadioGroup, Checkbox, CurrencyInput, MaskedInput,
                     # FileUpload, SignatureCanvas, ProgressBar, StepNavigation)
    steps/           # Step1LoanType ... Step8Review
    Wizard.jsx       # step registry, navigation, auto-save wiring, resume modal
  context/
    FormDataContext.jsx   # shared cross-step form state (Context, not Redux -
                           # scoped to a single wizard instance)
  schemas/
    schemaFactory.js       # per-step Zod schemas + cross-step dependency logic
  hooks/
    useAutoSave.js         # encrypts + persists form state every 30s
    useFormPersistence.js  # detects/resumes a saved draft on load
    usePinCodeLookup.js    # simulated PIN code -> city/state/post office
    useVerification.js     # simulated PAN/Aadhaar verification (1.5s delay)
  utils/
    validators.js       # PAN format, Aadhaar Verhoeff checksum, GST, mobile, name
    emiCalculator.js     # EMI / total cost / processing fee formulas
    encryption.js         # AES-256-GCM via Web Crypto API
    imageCompression.js   # Canvas-based client-side image compression
    formatters.js         # Indian number formatting (10,50,000), PII masking
    pinCodeData.json       # static dataset covering all states/UTs
cypress/
  e2e/               # 13 spec files, 30+ individual test cases
  fixtures/          # valid applicant data per loan type + sample upload files
  support/           # custom commands (fillStep1...fillStep6, uploadAllDocuments...)
```

See `ARCHITECTURE.md` for the reasoning behind these choices.

## Testing

```bash
npm run test:e2e
```

This starts the dev server and runs the full Cypress suite headlessly. Spec files:

| File | Covers |
|---|---|
| `personal-loan-happy-path.cy.js` | Full personal loan submission (no co-applicant) |
| `home-loan-happy-path.cy.js` | Full home loan submission (mandatory co-applicant) |
| `business-loan-happy-path.cy.js` | Full business loan submission (GST/ITR/registration docs) |
| `validation-errors.cy.js` | Required-field and format errors across all 8 steps |
| `pin-code-lookup.cy.js` | PIN code auto-fill + not-found handling |
| `employment-switching.cy.js` | Salaried/Self-Employed/Business Owner sub-form swapping |
| `co-applicant-visibility.cy.js` | Step 6 conditional visibility rules |
| `file-upload.cy.js` | Valid upload, oversized rejection, wrong-type rejection, removal |
| `e-signature.cy.js` | Signature capture, clear, and validation |
| `auto-save-resume.cy.js` | Encrypted draft persistence + resume/start-fresh modal |
| `keyboard-navigation.cy.js` | Keyboard-only completion of Step 1/2, WCAG 2.4.3 focus order |
| `stress-test.cy.js` | Rapid navigation, double-submit prevention, step re-insertion, max-length input |
| `cross-step-dependency.cy.js` | Changing loan type after Step 5 re-validates dependent steps |

Total: 30+ individual test cases across 13 files, well above the 15-journey minimum.

**Note on timing:** the auto-save tests wait out the real 30-second interval
(`cy.wait(31000)`) rather than mocking the clock, since the encryption step uses
the native (non-fakeable) Web Crypto `subtle` API. These two tests will take
roughly 35s each to run.

## Architecture Decisions

- **Wizard + Step Registry pattern** (Pattern 3 from the assignment brief): the
  `Wizard` component owns navigation, step visibility, and progress tracking;
  each step is its own React Hook Form instance; a shared `FormDataContext`
  holds the accumulated cross-step state. This cleanly separates orchestration
  from per-step validation while keeping cross-step dependencies (e.g. Step 3
  PAN verification affecting Step 7's document checklist) straightforward to
  read from context.
- **Why React Hook Form over Formik:** RHF uses uncontrolled inputs internally
  (via refs), so typing in one field does not re-render the other 49+ fields on
  the form - important on the mid-range Android devices this product targets.
- **Why Zod (v3 API) over Yup:** `.superRefine()` gives fine-grained control
  over cross-step validation messages tied to specific fields, and integrates
  with RHF via `@hookform/resolvers/zod`.
- **`react/jsx-props-no-spreading` is disabled** in `.eslintrc.json`. RHF's
  `register()` returns `{ name, onChange, onBlur, ref }` that must be spread
  onto the underlying `<input>` for the compound `Input`/`Select`/etc.
  components to work as drop-in RHF-compatible primitives - this is standard
  practice in RHF codebases and a deliberate, documented exception to the
  otherwise-strict Airbnb config.
- **Auto-save encryption:** AES-256-GCM via `window.crypto.subtle`, with a
  hardcoded passphrase for this simulation (a real deployment would derive a
  per-user key). Drafts are versioned (`SCHEMA_VERSION`) and TTL'd at 72 hours;
  a version mismatch or expired draft is discarded rather than loaded.

## Known Limitations

- The Cypress browser binary itself could not be pre-installed in the
  environment this project was authored in (network-restricted sandbox), so
  the suite has been written and structurally verified but not executed
  end-to-end there. Run `npm run test:e2e` locally to execute it - all 8 steps,
  utilities, and the production build have been independently verified
  (`npm run build`, ESLint, and targeted Node-level checks of the validators/EMI
  calculator all pass).
- PIN code dataset covers ~100 representative codes across all states/UTs
  rather than the full India Post dataset; unmatched codes fall back to manual
  entry with a clear message, as specified.
- Multi-tab draft-conflict detection (Section E3.2) is not implemented beyond
  "last write wins" - each tab still auto-saves independently to the same key.
- react-signature-canvas ships a peer-dependency notice for React 19; it works
  correctly in this project but a fully first-party-maintained alternative
  would be preferable long-term.

## Deployment

Not deployed by default. To deploy to Vercel:

```bash
npm run build
npx vercel --prod
```

Then update this section with the live URL.
