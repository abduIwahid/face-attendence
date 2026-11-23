/**
 * Browser face pipeline (brain/ARCHITECTURE.md): model loading + descriptor
 * extraction with @vladmandic/face-api (the maintained face-api.js fork —
 * brain/DECISIONS.md ADR-008). Weights are self-hosted in `public/models/`
 * — no runtime CDN fetch (brain/SECURITY.md).
 *
 * The library is imported dynamically so it never enters the server bundle
 * or any page that does not capture faces.
 */

type FaceApiModule = typeof import("@vladmandic/face-api");

let faceApiPromise: Promise<FaceApiModule> | null = null;
let modelsPromise: Promise<void> | null = null;

async function getFaceApi(): Promise<FaceApiModule> {
  if (!faceApiPromise) {
    faceApiPromise = import("@vladmandic/face-api");
  }
  return faceApiPromise;
}

/** Load the three nets once; later calls return the same promise. */
export function loadFaceModels(): Promise<void> {
  if (!modelsPromise) {
    modelsPromise = (async () => {
      const faceapi = await getFaceApi();
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
    })();
    // A failed load should not poison the singleton — allow a retry.
    modelsPromise.catch(() => {
      modelsPromise = null;
    });
  }
  return modelsPromise;
}

export type FaceCount = 0 | 1 | "multiple";

/** Count faces in a frame (cheap pass used for the live "face in view" hint). */
export async function countFaces(
  input: HTMLVideoElement | HTMLCanvasElement,
): Promise<FaceCount> {
  const faceapi = await getFaceApi();
  const detections = await faceapi.detectAllFaces(
    input,
    new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }),
  );
  if (detections.length === 0) return 0;
  if (detections.length > 1) return "multiple";
  return 1;
}

export type DescriptorResult =
  | { kind: "ok"; descriptor: number[] }
  | { kind: "no-face" }
  | { kind: "multiple-faces" };

/**
 * Compute the 128-d descriptor for the single face in a captured frame.
 * Exactly one face is required — zero or several faces are honest failures,
 * never a guess (brain/ETHICS_PRIVACY.md).
 */
export async function computeDescriptor(
  canvas: HTMLCanvasElement,
): Promise<DescriptorResult> {
  const faceapi = await getFaceApi();
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.5,
  });
  const detections = await faceapi.detectAllFaces(canvas, options);
  if (detections.length === 0) return { kind: "no-face" };
  if (detections.length > 1) return { kind: "multiple-faces" };

  const single = await faceapi
    .detectSingleFace(canvas, options)
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!single) return { kind: "no-face" };
  return { kind: "ok", descriptor: Array.from(single.descriptor) };
}
