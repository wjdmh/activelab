/**
 * MediaPipe PoseLandmarker 기반 자세 분석
 * @mediapipe/tasks-vision 사용
 */
import type { PostureResult, PostureMetrics } from "@/types/posture";
import { POSE_LANDMARKS } from "@/types/posture";

// MediaPipe CDN에서 모델 로드
const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

let landmarkerPromise: Promise<import("@mediapipe/tasks-vision").PoseLandmarker> | null = null;

export async function getPoseLandmarker() {
  if (landmarkerPromise) return landmarkerPromise;

  landmarkerPromise = (async () => {
    const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
    return PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numPoses: 1,
    });
  })();

  return landmarkerPromise;
}

/**
 * video 엘리먼트의 현재 프레임에서 자세를 분석해 PostureResult 반환
 * 감지 실패 시 null 반환
 */
export async function analyzePostureFromVideo(
  video: HTMLVideoElement
): Promise<PostureResult | null> {
  try {
    const landmarker = await getPoseLandmarker();
    const result = landmarker.detect(video);

    if (!result.landmarks || result.landmarks.length === 0) return null;

    const lm = result.landmarks[0];
    return computeMetrics(lm);
  } catch (e) {
    console.error("Pose analysis failed:", e);
    return null;
  }
}

/**
 * landmark 좌표(0~1 정규화)에서 자세 지표 계산
 */
function computeMetrics(
  lm: { x: number; y: number; z: number; visibility?: number }[]
): PostureResult {
  const lShoulder = lm[POSE_LANDMARKS.LEFT_SHOULDER];
  const rShoulder = lm[POSE_LANDMARKS.RIGHT_SHOULDER];
  const lEar = lm[POSE_LANDMARKS.LEFT_EAR];
  const rEar = lm[POSE_LANDMARKS.RIGHT_EAR];
  const lHip = lm[POSE_LANDMARKS.LEFT_HIP];
  const rHip = lm[POSE_LANDMARKS.RIGHT_HIP];

  // 어깨 중점 / 귀 중점
  const shoulderMidX = (lShoulder.x + rShoulder.x) / 2;
  const shoulderMidY = (lShoulder.y + rShoulder.y) / 2;
  const earMidX = (lEar.x + rEar.x) / 2;

  // 몸통 기준 스케일 (어깨~골반)
  const hipMidY = (lHip.y + rHip.y) / 2;
  const bodyHeight = Math.max(hipMidY - shoulderMidY, 0.001); // 0 나누기 방지
  const bodyWidth = Math.abs(lShoulder.x - rShoulder.x) || 0.001;

  // 1. 전방 두부 자세: 귀 중점이 어깨 중점보다 앞(x축 상 어깨 너비 비율)으로 나온 정도
  //    정면 카메라 기준 → x축 차이를 어깨 너비로 정규화
  const forwardHead = Math.abs(earMidX - shoulderMidX) / bodyWidth;

  // 2. 어깨 비대칭: 좌우 어깨 y 차이 / 몸통 높이
  const shoulderAsymmetry = Math.abs(lShoulder.y - rShoulder.y) / bodyHeight;

  // 3. 골반 비대칭: 좌우 골반 y 차이 / 몸통 높이
  const hipAsymmetry = Math.abs(lHip.y - rHip.y) / bodyHeight;

  const metrics: PostureMetrics = {
    forwardHead: Math.round(forwardHead * 1000) / 1000,
    shoulderAsymmetry: Math.round(shoulderAsymmetry * 1000) / 1000,
    hipAsymmetry: Math.round(hipAsymmetry * 1000) / 1000,
    score: 0,
  };

  // 점수 계산 (100점 기준으로 차감)
  let score = 100;
  const findings: string[] = [];

  // 전방 두부
  if (forwardHead > 0.25) {
    score -= 20;
    findings.push("전방 두부 자세 (심함): 목을 앞으로 내밀고 있어요");
  } else if (forwardHead > 0.12) {
    score -= 10;
    findings.push("경미한 전방 두부 자세: 목이 약간 앞으로 쏠려 있어요");
  }

  // 어깨 비대칭
  if (shoulderAsymmetry > 0.06) {
    score -= 15;
    const side = lm[POSE_LANDMARKS.LEFT_SHOULDER].y > lm[POSE_LANDMARKS.RIGHT_SHOULDER].y ? "왼쪽" : "오른쪽";
    findings.push(`어깨 비대칭 (심함): ${side} 어깨가 눈에 띄게 낮아요`);
  } else if (shoulderAsymmetry > 0.03) {
    score -= 8;
    const side = lm[POSE_LANDMARKS.LEFT_SHOULDER].y > lm[POSE_LANDMARKS.RIGHT_SHOULDER].y ? "왼쪽" : "오른쪽";
    findings.push(`경미한 어깨 비대칭: ${side} 어깨가 살짝 낮아요`);
  }

  // 골반 비대칭
  if (hipAsymmetry > 0.05) {
    score -= 10;
    findings.push("골반 기울기 감지: 골반이 한쪽으로 기울어져 있어요");
  } else if (hipAsymmetry > 0.025) {
    score -= 5;
    findings.push("경미한 골반 기울기: 골반이 약간 기울어져 있어요");
  }

  score = Math.max(score, 0);
  metrics.score = score;

  if (findings.length === 0) {
    findings.push("전반적으로 균형 잡힌 자세예요");
  }

  const grade: PostureResult["grade"] =
    score >= 80 ? "good" : score >= 60 ? "fair" : "needs_attention";

  return {
    metrics,
    findings,
    grade,
    scannedAt: new Date().toISOString(),
  };
}
