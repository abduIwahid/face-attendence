"use client";

import { Camera, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { computeDescriptor, countFaces, loadFaceModels } from "../lib/face";
import FaceStatus, { type FaceHint } from "./FaceStatus";

export interface FaceCapture {
  descriptor: number[];
  /** Raw base64 JPEG (no data-URL prefix) of the captured frame. */
  photoBase64: string;
}

interface CameraCaptureProps {
  /**
   * When false the camera stays off and an explanatory panel is shown —
   * the register page uses this to honour consent-before-camera
   * (brain/ETHICS_PRIVACY.md principle 1).
   */
  active: boolean;
  inactiveMessage?: string;
  captureLabel?: string;
  onCapture: (capture: FaceCapture) => void;
  onClear?: () => void;
}

type CaptureStatus =
  | "inactive"
  | "loading-models"
  | "starting-camera"
  | "streaming"
  | "capturing"
  | "captured"
  | "camera-error"
  | "models-error";

const MAX_FRAME_WIDTH = 640;
const MAX_PHOTO_WIDTH = 480;

/** Draw the current video frame (mirrored, like the preview) onto a canvas. */
function drawFrame(video: HTMLVideoElement, maxWidth: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxWidth / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  const context = canvas.getContext("2d");
  if (context) {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

export default function CameraCapture({
  active,
  inactiveMessage = "The camera will open here.",
  captureLabel = "Capture",
  onCapture,
  onClear,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hintTimerRef = useRef<number | null>(null);
  const runIdRef = useRef(0);
  const [status, setStatus] = useState<CaptureStatus>("inactive");
  const [faceHint, setFaceHint] = useState<FaceHint>("checking");
  const [notice, setNotice] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (hintTimerRef.current !== null) {
      window.clearInterval(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const start = useCallback(async () => {
    const runId = (runIdRef.current += 1);
    setNotice(null);
    setFaceHint("checking");
    setStatus("loading-models");
    try {
      await loadFaceModels();
    } catch {
      if (runIdRef.current === runId) setStatus("models-error");
      return;
    }
    if (runIdRef.current !== runId) return;
    setStatus("starting-camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (runIdRef.current !== runId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      if (runIdRef.current !== runId) return;
      setStatus("streaming");
      hintTimerRef.current = window.setInterval(() => {
        const current = videoRef.current;
        if (!current || current.readyState < 2) return;
        void countFaces(current)
          .then((count) => {
            if (runIdRef.current !== runId) return;
            setFaceHint(count === 1 ? "one" : count === 0 ? "none" : "multiple");
          })
          .catch(() => {
            /* a failed hint pass is not fatal — capture does its own check */
          });
      }, 900);
    } catch {
      if (runIdRef.current === runId) setStatus("camera-error");
    }
  }, []);

  useEffect(() => {
    // This effect synchronizes with an external system (the camera + model
    // loader); the state updates inside start() are its setup, not a
    // render cascade.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (active) {
      void start();
    } else {
      runIdRef.current += 1;
      stopStream();
      setStatus("inactive");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      runIdRef.current += 1;
      stopStream();
    };
  }, [active, start, stopStream]);

  async function handleCapture() {
    const video = videoRef.current;
    if (!video || status !== "streaming" || video.videoWidth === 0) return;
    setStatus("capturing");
    setNotice(null);
    try {
      const frame = drawFrame(video, MAX_FRAME_WIDTH);
      const result = await computeDescriptor(frame);
      if (result.kind === "no-face") {
        setNotice("No face was found in that shot. Centre your face in the oval, face the light, and try again.");
        setStatus("streaming");
        return;
      }
      if (result.kind === "multiple-faces") {
        setNotice("More than one face was found. Only you should be in the frame — please retake.");
        setStatus("streaming");
        return;
      }
      const photoCanvas = drawFrame(video, MAX_PHOTO_WIDTH);
      const dataUrl = photoCanvas.toDataURL("image/jpeg", 0.85);
      setThumbnail(dataUrl);
      onCapture({
        descriptor: result.descriptor,
        photoBase64: dataUrl.split(",")[1] ?? "",
      });
      stopStream();
      setStatus("captured");
    } catch {
      setNotice("Something went wrong while reading your face. Please try again.");
      setStatus("streaming");
    }
  }

  function handleRetake() {
    setThumbnail(null);
    onClear?.();
    void start();
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-muted">
        {/* The video element is always mounted so the ref exists when the stream starts. */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label="Camera preview"
          className={`absolute inset-0 h-full w-full -scale-x-100 object-cover ${
            status === "streaming" || status === "capturing" ? "" : "hidden"
          }`}
        />
        {(status === "streaming" || status === "capturing") && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-white/80"
          />
        )}

        {status === "captured" && thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element -- local data URL thumbnail of the student's own capture
          <img
            src={thumbnail}
            alt="Your captured selfie"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {status === "inactive" && (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <div className="flex h-56 w-44 items-center justify-center rounded-full border-2 border-dashed border-border-strong">
              <Camera className="h-10 w-10 text-secondary" aria-hidden />
            </div>
            <p className="max-w-xs text-sm text-secondary">{inactiveMessage}</p>
          </div>
        )}

        {(status === "loading-models" || status === "starting-camera") && (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent-strong" aria-hidden />
            <p className="text-sm text-secondary">
              {status === "loading-models"
                ? "Loading the face models (one-time, a few seconds)…"
                : "Opening your camera…"}
            </p>
          </div>
        )}

        {status === "camera-error" && (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <Camera className="h-10 w-10 text-danger" aria-hidden />
            <p className="max-w-xs text-sm font-medium text-danger">
              The camera could not be opened. Allow camera permission in your
              browser, make sure no other app is using it, then retry.
            </p>
          </div>
        )}

        {status === "models-error" && (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <Camera className="h-10 w-10 text-danger" aria-hidden />
            <p className="max-w-xs text-sm font-medium text-danger">
              The face models failed to load. Check your connection, then retry.
            </p>
          </div>
        )}
      </div>

      {status === "streaming" || status === "capturing" ? (
        <FaceStatus hint={faceHint} />
      ) : null}
      {status === "captured" ? (
        <p role="status" className="text-sm font-medium text-success-strong">
          Selfie captured. If it does not look clear, retake it.
        </p>
      ) : null}
      {notice ? (
        <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
          {notice}
        </p>
      ) : null}

      <div className="flex gap-3">
        {status === "streaming" || status === "capturing" ? (
          <button
            type="button"
            onClick={handleCapture}
            disabled={status === "capturing"}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-base font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {status === "capturing" ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Camera className="h-5 w-5" aria-hidden />
            )}
            {status === "capturing" ? "Reading your face…" : captureLabel}
          </button>
        ) : null}
        {status === "captured" ? (
          <button
            type="button"
            onClick={handleRetake}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-base font-semibold text-primary transition-colors hover:bg-surface-muted"
          >
            <RefreshCw className="h-5 w-5" aria-hidden />
            Retake
          </button>
        ) : null}
        {status === "camera-error" || status === "models-error" ? (
          <button
            type="button"
            onClick={() => void start()}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-base font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            <RefreshCw className="h-5 w-5" aria-hidden />
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
