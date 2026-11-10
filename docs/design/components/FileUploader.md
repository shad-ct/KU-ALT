# Component Specification: FileUploader

## 1. Purpose
The `FileUploader` handles the ingestion of mandatory institutional evidence: qualification certificates, NOC letters, RAC progress reports, payment vouchers, and equipment consent forms. It enforces strict file type constraints (PDF/PNG/JPEG), file size caps, secure MIME validation feedback, and clear file replacement/removal.

---

## 2. Anatomy
```
+-----------------------------------------------------------------------------------+
| Qualification Certificate (PDF only, max 5MB) *                                   | <-- Label
+-----------------------------------------------------------------------------------+
|  [Upload Icon]  Drag and drop file here, or [Browse files]                        | <-- Dropzone Surface
|                 Accepted formats: PDF · Maximum size: 5 MB                        |
+-----------------------------------------------------------------------------------+
| [PDF Icon] MSc_Degree_Certificate.pdf (1.8 MB)                 [Preview] [Remove] | <-- Uploaded File Item
+-----------------------------------------------------------------------------------+
```

---

## 3. Props Interface
```typescript
interface UploadedFileMeta {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  url?: string;
  uploadedAt: string;
}

interface FileUploaderProps {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  acceptedFormats: ('application/pdf' | 'image/jpeg' | 'image/png')[];
  maxSizeBytes: number; // e.g. 5 * 1024 * 1024 for 5MB
  value?: UploadedFileMeta | UploadedFileMeta[] | null;
  multiple?: boolean;
  disabled?: boolean;
  error?: string;
  onUpload: (files: File[]) => Promise<void>;
  onRemove: (fileId: string) => void;
  onPreview?: (file: UploadedFileMeta) => void;
}
```

---

## 4. States
- **Default:** Clean off-white surface (`--color-surface-card`), 1px dashed border (`--color-border-default`), text secondary (`--color-text-secondary`). Corner radius 4px.
- **Drag Over:** Border transitions to 1px solid `--color-accent-default`, background becomes light accent tint (`--color-accent-subtle`).
- **Focus Visible:** Dropzone button receives 2px solid `--color-border-focus` ring with 2px offset.
- **Uploaded (File Present):**
  - Dropzone is replaced or supplemented by an uploaded row item (solid 1px border `--color-border-subtle`, 40px height, file icon, filename, file size, action buttons).
- **Loading / Uploading:**
  - Progress bar (height 2px, `--color-accent-default`) across top of file row, showing upload percentage.
  - Buttons disabled during upload.
- **Error (Client or Server rejection):**
  - Border transitions to 1px solid `--color-danger-text`.
  - Inline error text under field (`--color-danger-text`, 13px) explaining the exact fault (e.g., "File exceeds maximum size limit of 5 MB" or "Invalid file type. Only official PDF documents are accepted.").
- **Disabled:** Background `--color-surface-subtle`, border `--color-border-subtle`, cursor `not-allowed`.

---

## 5. Keyboard Behaviour
- `Tab`: Focuses the hidden file input trigger button.
- `Enter` / `Space`: Opens native system file picker dialog.
- Inside uploaded files list: `Tab` moves focus to "Preview" and "Remove" action buttons.
- `Escape`: Closes file preview dialog if open.

---

## 6. ARIA & Accessibility
- Dropzone has `role="button"` and `tabindex="0"`.
- Associated label connected via `aria-labelledby` or wrapped in `<label>`.
- Error messages connected via `aria-describedby="[id]-error"`.
- Real-time upload status announced using `aria-live="polite"`: `"MSc_Degree_Certificate.pdf uploaded successfully."`

---

## 7. Do / Don't
- **DO:** Explicitly state the permitted file extensions and file size ceiling in the helper label before upload.
- **DO:** Display human-readable file sizes (e.g. "1.4 MB", "320 KB").
- **DON'T:** Use generic error messages like "Upload failed". Specify whether it was file size, mime-type rejection, or server timeout.
- **DON'T:** Allow automatic upload of executable formats (.exe, .sh, .bat, .zip) under any circumstances.

