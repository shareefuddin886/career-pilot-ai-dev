import { useRef, useState } from "react";
import { AlertCircle, FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.docx";

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileKind(name: string) {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  return ext === "pdf" ? "PDF" : ext === "docx" ? "DOCX" : ext.toUpperCase();
}

function validate(file: File): string | null {
  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
    return "This file type isn't supported. Please upload a PDF or DOCX.";
  }
  if (file.size > MAX_BYTES) return "This file is larger than 5 MB. Please upload a smaller file.";
  if (file.size === 0) return "This file appears to be empty. Please choose another file.";
  return null;
}

function FileRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3">
      <FileText className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {fileKind(file.name)} · {formatSize(file.size)}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove file">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function DropZone({
  label,
  onPick,
  inputId,
}: {
  label: string;
  onPick: (f: File) => void;
  inputId: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onPick(f);
      }}
      className={`rounded-md border border-dashed px-6 py-8 text-center transition-colors ${
        over ? "border-primary bg-primary/5" : "border-border bg-surface/50"
      }`}
    >
      <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground/80">PDF or DOCX, up to 5 MB</p>
      <input
        id={inputId}
        ref={ref}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
      <Button variant="outline" className="mt-4" onClick={() => ref.current?.click()}>
        Choose file
      </Button>
    </div>
  );
}

export type UploadState = {
  resume: File | null;
  jdFile: File | null;
  jdText: string;
};

export function UploadStep({
  state,
  setState,
  onStart,
  error,
}: {
  state: UploadState;
  setState: (s: UploadState) => void;
  onStart: () => void;
  error: string | null;
}) {
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [jdError, setJdError] = useState<string | null>(null);
  const [jdMode, setJdMode] = useState<"upload" | "paste">("paste");

  return (
    <section className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Resume */}
        <div className="flex flex-col rounded-lg border border-border bg-surface/40 p-6">
          <h2 className="text-base font-semibold">Resume</h2>
          <p className="mt-1 text-sm text-muted-foreground">Upload your resume.</p>
          <div className="mt-5 flex-1">
            {state.resume ? (
              <FileRow
                file={state.resume}
                onRemove={() => setState({ ...state, resume: null })}
              />
            ) : (
              <DropZone
                inputId="resume-input"
                label="Drag your resume here, or choose a file"
                onPick={(f) => {
                  const err = validate(f);
                  setResumeError(err);
                  if (!err) setState({ ...state, resume: f });
                }}
              />
            )}
            {resumeError ? (
              <p className="mt-3 flex items-start gap-2 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {resumeError}
              </p>
            ) : null}
          </div>
        </div>

        {/* Job description */}
        <div className="flex flex-col rounded-lg border border-border bg-surface/40 p-6">
          <h2 className="text-base font-semibold">Job Description</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional — add a job description for a role-specific review.
          </p>

          <div className="mt-5 flex gap-2">
            {(["paste", "upload"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setJdMode(m)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  jdMode === m
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "paste" ? "Paste text" : "Upload file"}
              </button>
            ))}
          </div>

          <div className="mt-4 flex-1">
            {jdMode === "paste" ? (
              <Textarea
                value={state.jdText}
                onChange={(e) => setState({ ...state, jdText: e.target.value, jdFile: null })}
                placeholder="Paste the job description here…"
                className="min-h-[188px] resize-y bg-surface"
              />
            ) : state.jdFile ? (
              <FileRow file={state.jdFile} onRemove={() => setState({ ...state, jdFile: null })} />
            ) : (
              <DropZone
                inputId="jd-input"
                label="Drag the job description here, or choose a file"
                onPick={(f) => {
                  const err = validate(f);
                  setJdError(err);
                  if (!err) setState({ ...state, jdFile: f, jdText: "" });
                }}
              />
            )}
            {jdError ? (
              <p className="mt-3 flex items-start gap-2 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {jdError}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button
          size="lg"
          className="w-full sm:w-auto"
          disabled={!state.resume}
          onClick={onStart}
        >
          Review Resume
        </Button>
        <p className="text-xs text-muted-foreground">
          {state.resume
            ? state.jdFile || state.jdText.trim().length > 40
              ? "We'll run a general review and a role-specific comparison."
              : "We'll run a general review. Add a job description for a role-specific comparison."
            : "Please upload a resume to continue."}
        </p>
      </div>
    </section>
  );
}
