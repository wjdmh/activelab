/**
 * MediaPipe PoseLandmarker 분석 결과
 * 체형·자세 진단에서 한 프레임을 캡처해 계산
 */
export interface PostureMetrics {
  /** 전방 두부 자세: 귀-어깨 수평 오프셋 (정규화, 0=완벽, 양수=앞으로 쏠림) */
  forwardHead: number;
  /** 어깨 비대칭: 좌우 어깨 높이 차이 (정규화, 0=대칭, 양수=우측 낮음) */
  shoulderAsymmetry: number;
  /** 골반 비대칭: 좌우 골반 높이 차이 (정규화) */
  hipAsymmetry: number;
  /** 총 자세 점수 (0~100, 높을수록 좋음) */
  score: number;
}

export interface PostureResult {
  metrics: PostureMetrics;
  /** 주요 발견 사항 (한국어 문자열 배열) */
  findings: string[];
  /** 자세 등급: good | fair | needs_attention */
  grade: "good" | "fair" | "needs_attention";
  scannedAt: string;
}

/**
 * MediaPipe landmark index (33 pose landmarks)
 */
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
} as const;
