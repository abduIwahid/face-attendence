import { AlertTriangle, CheckCircle2, ScanFace, Search } from "lucide-react";

export type FaceHint = "checking" | "none" | "one" | "multiple";

/**
 * The live face-detection hint shown under the camera preview
 * (brain/ARCHITECTURE.md component plan). Plain, non-accusatory language
 * (brain/ETHICS_PRIVACY.md: a failed check is never an accusation).
 */
export default function FaceStatus({ hint }: { hint: FaceHint }) {
  if (hint === "one") {
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-medium text-accent-strong">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
        Face found — hold still, then tap Capture.
      </p>
    );
  }
  if (hint === "multiple") {
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-medium text-warning">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
        More than one face is in view — only you should be in the frame.
      </p>
    );
  }
  if (hint === "none") {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-secondary">
        <ScanFace className="h-4 w-4 shrink-0" aria-hidden />
        No face in view — centre your face in the oval.
      </p>
    );
  }
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-secondary">
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      Looking for your face…
    </p>
  );
}
