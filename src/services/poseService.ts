import { Landmark3D, CameraGuidance } from '../types';

// Standard MediaPipe Pose Skeleton Joint Connections
export const POSE_CONNECTIONS: [number, number][] = [
  // Head & Face
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  // Torso
  [11, 12], // Shoulders
  [11, 23], [12, 24], // Shoulders to Hips
  [23, 24], // Hips
  // Arms
  [11, 13], [13, 15], // Left Arm
  [15, 17], [15, 19], [15, 21], [17, 19], // Left Hand
  [12, 14], [14, 16], // Right Arm
  [16, 18], [16, 20], [16, 22], [18, 20], // Right Hand
  // Legs
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31], // Left Leg & Foot
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32], // Right Leg & Foot
];

export class PoseService {
  private poseInstance: any = null;
  private isModelLoaded = false;
  private lastFrameTime = performance.now();
  private frameCount = 0;
  private currentFps = 30;

  /**
   * Initializes MediaPipe Pose library via CDN fallback or bundle
   */
  public async initializePose(onResults: (landmarks: Landmark3D[], confidence: number) => void): Promise<boolean> {
    try {
      // Check if MediaPipe is available on window or load script
      if (!(window as any).Pose) {
        await this.loadMediaPipeScript();
      }

      const PoseClass = (window as any).Pose;
      if (!PoseClass) {
        console.warn("MediaPipe Pose class not found on window");
        return false;
      }

      this.poseInstance = new PoseClass({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });

      this.poseInstance.onResults((results: any) => {
        // Calculate real FPS
        const now = performance.now();
        this.frameCount++;
        if (now - this.lastFrameTime >= 1000) {
          this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
          this.frameCount = 0;
          this.lastFrameTime = now;
        }

        if (results && results.poseLandmarks && results.poseLandmarks.length === 33) {
          const landmarks: Landmark3D[] = results.poseLandmarks.map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z || 0,
            visibility: lm.visibility !== undefined ? lm.visibility : 1.0
          }));

          // Calculate average visibility/confidence
          const avgConfidence = landmarks.reduce((acc, curr) => acc + (curr.visibility || 0.8), 0) / landmarks.length;
          onResults(landmarks, Math.round(avgConfidence * 100) / 100);
        } else {
          onResults([], 0);
        }
      });

      this.isModelLoaded = true;
      return true;
    } catch (err) {
      console.error("Error initializing MediaPipe Pose:", err);
      return false;
    }
  }

  private loadMediaPipeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Pose) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  /**
   * Process a single video frame with MediaPipe
   */
  public async sendFrame(videoElement: HTMLVideoElement) {
    if (this.poseInstance && this.isModelLoaded && videoElement && videoElement.readyState >= 2) {
      try {
        await this.poseInstance.send({ image: videoElement });
      } catch (err) {
        // Frame drop tolerance
      }
    }
  }

  public getFps(): number {
    return this.currentFps;
  }

  public close() {
    if (this.poseInstance) {
      try {
        this.poseInstance.close();
      } catch (e) {}
      this.poseInstance = null;
      this.isModelLoaded = false;
    }
  }

  /**
   * Checks for camera placement, occlusions, and visibility issues
   */
  public evaluateGuidance(landmarks: Landmark3D[], confidence: number): CameraGuidance {
    const warnings: string[] = [];

    if (!landmarks || landmarks.length < 33 || confidence < 0.3) {
      return {
        isFullyVisible: false,
        warnings: ["No patient pose detected. Step in front of the camera."],
        poseConfidence: confidence,
        fps: this.currentFps
      };
    }

    // Check hips visibility (indices 23, 24)
    const hipsVisible = (landmarks[23].visibility || 0) > 0.5 && (landmarks[24].visibility || 0) > 0.5;
    // Check knees visibility (indices 25, 26)
    const kneesVisible = (landmarks[25].visibility || 0) > 0.5 && (landmarks[26].visibility || 0) > 0.5;
    // Check ankles / feet visibility (indices 27, 28)
    const feetVisible = (landmarks[27].visibility || 0) > 0.5 && (landmarks[28].visibility || 0) > 0.5;
    // Check shoulders (indices 11, 12)
    const shouldersVisible = (landmarks[11].visibility || 0) > 0.5 && (landmarks[12].visibility || 0) > 0.5;

    if (!feetVisible) {
      warnings.push("Feet are not fully visible. Step back 1–2 meters.");
    }
    if (!kneesVisible) {
      warnings.push("Knees are partially occluded.");
    }
    if (!shouldersVisible) {
      warnings.push("Shoulders are not clearly visible.");
    }
    if (confidence < 0.65) {
      warnings.push("Low pose tracking confidence. Ensure adequate room lighting.");
    }

    return {
      isFullyVisible: warnings.length === 0,
      warnings,
      poseConfidence: confidence,
      fps: this.currentFps
    };
  }

  /**
   * Renders the true 33-point skeleton onto a matching canvas overlay
   */
  public renderSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark3D[],
    width: number,
    height: number,
    angles?: Record<string, number>
  ) {
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length < 33) return;

    // Draw connecting bones
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const [i, j] of POSE_CONNECTIONS) {
      const p1 = landmarks[i];
      const p2 = landmarks[j];

      if ((p1.visibility || 1) < 0.4 || (p2.visibility || 1) < 0.4) continue;

      const x1 = p1.x * width;
      const y1 = p1.y * height;
      const x2 = p2.x * width;
      const y2 = p2.y * height;

      // Beautiful gradient bone line from purple to cyan
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, 'rgba(169, 122, 255, 0.85)');
      grad.addColorStop(1, 'rgba(61, 222, 228, 0.85)');

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw joint landmark nodes
    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i];
      if ((p.visibility || 1) < 0.4) continue;

      const x = p.x * width;
      const y = p.y * height;

      // Key joints: shoulders(11,12), elbows(13,14), hips(23,24), knees(25,26), ankles(27,28)
      const isKeyJoint = [11, 12, 13, 14, 23, 24, 25, 26, 27, 28].includes(i);
      const radius = isKeyJoint ? 6 : 3.5;

      // Outer glow
      ctx.beginPath();
      ctx.arc(x, y, radius + 3, 0, 2 * Math.PI);
      ctx.fillStyle = isKeyJoint ? 'rgba(61, 222, 228, 0.35)' : 'rgba(169, 122, 255, 0.2)';
      ctx.fill();

      // Inner core
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isKeyJoint ? '#3DDEE4' : '#C6A9FF';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Render live joint angle tags near key joints if provided
    if (angles) {
      this.renderAngleBadge(ctx, landmarks[25], `${Math.round(angles.left_knee || 0)}°`, width, height, 'LK');
      this.renderAngleBadge(ctx, landmarks[26], `${Math.round(angles.right_knee || 0)}°`, width, height, 'RK');
      this.renderAngleBadge(ctx, landmarks[23], `${Math.round(angles.left_hip || 0)}°`, width, height, 'LH');
      this.renderAngleBadge(ctx, landmarks[24], `${Math.round(angles.right_hip || 0)}°`, width, height, 'RH');
    }
  }

  private renderAngleBadge(
    ctx: CanvasRenderingContext2D,
    landmark: Landmark3D,
    text: string,
    width: number,
    height: number,
    label: string
  ) {
    if (!landmark || (landmark.visibility || 0) < 0.45) return;

    const x = landmark.x * width + 12;
    const y = landmark.y * height - 8;

    ctx.save();
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    const tag = `${label}: ${text}`;
    const textMetrics = ctx.measureText(tag);
    const boxW = textMetrics.width + 12;
    const boxH = 20;

    // Background pill
    ctx.fillStyle = 'rgba(7, 7, 19, 0.85)';
    ctx.strokeStyle = 'rgba(169, 122, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y - 14, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#43E6A0';
    ctx.fillText(tag, x + 6, y);
    ctx.restore();
  }
}

export const poseService = new PoseService();
