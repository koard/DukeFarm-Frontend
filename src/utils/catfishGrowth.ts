/**
 * =============================================================================
 * ระบบประเมินคุณภาพการเลี้ยงปลาดุก — Gompertz Growth Model
 * =============================================================================
 *
 * ใช้โมเดล Gompertz สำหรับจำลองอัตราการเจริญเติบโตมาตรฐานของปลาดุกลูกผสม (บิ๊กอุย)
 * ซึ่งเป็นโมเดลที่ใช้กันมาตรฐานในงานวิจัยประมง
 *
 * สูตร Gompertz (Shifted form):
 *
 *   W(t) = Wmax × (W0 / Wmax)^(e^(-L × t))
 *
 * โดย:
 *   - W(t)  = น้ำหนักมาตรฐาน ณ วัน t (กรัม)
 *   - W0    = น้ำหนักเริ่มต้นตอนปล่อยลงบ่อ (กรัม)
 *   - Wmax  = น้ำหนักเพดานสูงสุดที่ปลาจะโตถึง (กรัม)
 *   - L     = อัตรา Gompertz rate ที่ควบคุมความชันของ S-curve
 *   - t     = จำนวนวันที่เลี้ยงนับจากวันปล่อย
 *
 * คุณสมบัติ:
 *   - เมื่อ t=0 → W(0) = W0 (ตรงกับน้ำหนักเริ่มต้นพอดี)
 *   - เมื่อ t→∞ → W(t) → Wmax (เข้าใกล้เพดาน)
 *   - Smooth ทุกจุด ไม่มีรอยหักมุม (ต่างจากแบบ step-wise ADG)
 *   - ปรับตาม W0 อัตโนมัติ (ปลาที่เริ่มจากน้ำหนักต่างกัน จะได้เส้นมาตรฐานต่างกัน)
 *
 * ค่าพารามิเตอร์:
 *   - Wmax = 1200 กรัม → ปลาดุกบิ๊กอุยเลี้ยง 6-7 เดือน ได้ ~800-1000g, เพดานจริง ~1200g
 *   - L = 0.018        → Calibrate ให้เริ่มจาก 3g วันที่ 120 ได้ ~430g, วันที่ 180 ได้ ~850g
 *
 * ADG (Average Daily Gain) มาตรฐาน ณ วัน t (อนุพันธ์ของ Gompertz):
 *
 *   dW/dt = W(t) × L × e^(-L×t) × ln(Wmax / W0)
 *
 * =============================================================================
 */

// ---------------------------------------------------------------------------
// ค่าคงที่ (Constants)
// ---------------------------------------------------------------------------

/** พารามิเตอร์โมเดล Gompertz สำหรับปลาดุกลูกผสม (บิ๊กอุย) */
export const CATFISH_GROWTH_PARAMS = {
  /** น้ำหนักเพดานสูงสุด (กรัม) — ปลาดุกโตเต็มที่ประมาณ 1,200 กรัม */
  Wmax: 1200,

  /** อัตรา Gompertz rate — ควบคุมความชันของ S-curve */
  L: 0.018,

  /** ค่าเผื่อ (tolerance) สำหรับช่วงปกติ ±20% */
  TOLERANCE: 0.20,
} as const;

// ---------------------------------------------------------------------------
// ฟังก์ชันคำนวณ Gompertz
// ---------------------------------------------------------------------------

/**
 * คำนวณน้ำหนักมาตรฐาน ณ วัน t
 *
 * สูตร: W(t) = Wmax × (W0 / Wmax)^(e^(-L × t))
 *
 * @param initialWeightGr น้ำหนักเริ่มต้นตอนปล่อย (กรัม)
 * @param day จำนวนวันที่เลี้ยง
 * @returns น้ำหนักมาตรฐาน (กรัม)
 */
export function getStandardWeight(initialWeightGr: number, day: number): number {
  const { Wmax, L } = CATFISH_GROWTH_PARAMS;

  // ป้องกัน W0 = 0 หรือติดลบ
  if (initialWeightGr <= 0) return 0;

  // W(t) = Wmax × (W0 / Wmax)^(e^(-L × t))
  const ratio = initialWeightGr / Wmax;
  return Wmax * Math.pow(ratio, Math.exp(-L * day));
}

/**
 * คำนวณ ADG มาตรฐาน ณ วัน t (อนุพันธ์ของ Gompertz)
 *
 * สูตร: dW/dt = W(t) × L × e^(-L×t) × ln(Wmax / W0)
 *
 * @param initialWeightGr น้ำหนักเริ่มต้นตอนปล่อย (กรัม)
 * @param day จำนวนวันที่เลี้ยง
 * @returns ADG มาตรฐาน (กรัม/วัน)
 */
export function getStandardADG(initialWeightGr: number, day: number): number {
  const { Wmax, L } = CATFISH_GROWTH_PARAMS;
  if (initialWeightGr <= 0) return 0;

  const W_t = getStandardWeight(initialWeightGr, day);
  return W_t * L * Math.exp(-L * day) * Math.log(Wmax / initialWeightGr);
}

/**
 * สร้างข้อมูลเส้นมาตรฐาน (standard curve) สำหรับกราฟ
 * ให้จุดข้อมูลทุกวัน พร้อมช่วง upper/lower bound (±TOLERANCE)
 *
 * @param initialWeightGr น้ำหนักเริ่มต้นตอนปล่อย (กรัม)
 * @param totalDays จำนวนวันทั้งหมดที่จะสร้างเส้น
 * @returns array ของจุดข้อมูล { day, standard, upperBound, lowerBound }
 */
export function generateStandardCurve(
  initialWeightGr: number,
  totalDays: number,
): { day: number; standard: number; upperBound: number; lowerBound: number }[] {
  const { TOLERANCE } = CATFISH_GROWTH_PARAMS;
  const result: { day: number; standard: number; upperBound: number; lowerBound: number }[] = [];

  for (let d = 0; d <= totalDays; d++) {
    const w = getStandardWeight(initialWeightGr, d);
    result.push({
      day: d,
      standard: Math.round(w * 100) / 100,
      upperBound: Math.round(w * (1 + TOLERANCE) * 100) / 100,
      lowerBound: Math.round(w * (1 - TOLERANCE) * 100) / 100,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// ดัชนีการเจริญเติบโต (GPI — Growth Performance Index)
// ---------------------------------------------------------------------------

/**
 * คำนวณ GPI = (น้ำหนักจริง / น้ำหนักมาตรฐาน) × 100%
 *
 * เทียบน้ำหนักจริงที่เกษตรกรบันทึก กับน้ำหนักที่ควรเป็นตาม Gompertz
 *
 * @param actualWeightGr น้ำหนักจริงที่บันทึก (กรัม)
 * @param initialWeightGr น้ำหนักเริ่มต้น (กรัม)
 * @param daysSinceStart จำนวนวันตั้งแต่ปล่อย
 * @returns GPI เป็นเปอร์เซ็นต์ (เช่น 95 = 95%)
 */
export function calculateGPI(
  actualWeightGr: number,
  initialWeightGr: number,
  daysSinceStart: number,
): number {
  const standardWeight = getStandardWeight(initialWeightGr, daysSinceStart);
  if (standardWeight <= 0) return 0;
  return (actualWeightGr / standardWeight) * 100;
}

// ---------------------------------------------------------------------------
// อัตราการเจริญเติบโตรายวัน (ADG — Average Daily Gain)
// ---------------------------------------------------------------------------

/**
 * คำนวณ ADG จริงของเกษตรกร
 *
 * สูตร: ADG = (น้ำหนักปัจจุบัน − น้ำหนักเริ่มต้น) / จำนวนวัน
 *
 * @param currentWeightGr น้ำหนักปัจจุบัน (กรัม)
 * @param initialWeightGr น้ำหนักเริ่มต้น (กรัม)
 * @param days จำนวนวันที่เลี้ยง
 * @returns ADG (กรัม/วัน)
 */
export function calculateADG(
  currentWeightGr: number,
  initialWeightGr: number,
  days: number,
): number {
  if (days <= 0) return 0;
  return (currentWeightGr - initialWeightGr) / days;
}

// ---------------------------------------------------------------------------
// อัตราการรอดตาย (SR — Survival Rate)
// ---------------------------------------------------------------------------

/**
 * คำนวณ Survival Rate
 *
 * สูตร: SR = (ปลาคงเหลือ / ปลาปล่อย) × 100%
 *
 * @param remaining จำนวนปลาคงเหลือ
 * @param released จำนวนปลาที่ปล่อยเริ่มต้น
 * @returns SR เป็นเปอร์เซ็นต์
 */
export function calculateSR(remaining: number, released: number): number {
  if (released <= 0) return 0;
  return (remaining / released) * 100;
}

// ---------------------------------------------------------------------------
// อัตราการเปลี่ยนอาหารเป็นเนื้อ (FCR — Feed Conversion Ratio)
// ---------------------------------------------------------------------------

/**
 * คำนวณ FCR (Feed Conversion Ratio)
 *
 * สูตร: FCR = อาหารทั้งหมด (กก.) / น้ำหนักเนื้อที่เพิ่มขึ้นทั้งหมด (กก.)
 *
 * น้ำหนักเนื้อที่เพิ่ม = (น้ำหนักล่าสุด × ปลาคงเหลือ / 1000)
 *                       − (น้ำหนักเริ่มต้น × ปลาปล่อย / 1000)
 *
 * หมายเหตุ: FCR ที่ดีสำหรับปลาดุกอยู่ที่ ≤ 1.5, ปกติ 1.5-2.0
 *
 * @param totalFoodKg อาหารทั้งหมดที่ใช้ (กก.)
 * @param currentWeightGr น้ำหนักปลาปัจจุบัน (กรัม)
 * @param initialWeightGr น้ำหนักปลาเริ่มต้น (กรัม)
 * @param fishReleased จำนวนปลาที่ปล่อย
 * @param fishRemaining จำนวนปลาคงเหลือ
 * @returns FCR หรือ null ถ้าคำนวณไม่ได้ (น้ำหนักไม่เพิ่ม)
 */
export function calculateFCR(
  totalFoodKg: number,
  currentWeightGr: number,
  initialWeightGr: number,
  fishReleased: number,
  fishRemaining: number,
): number | null {
  // น้ำหนักรวมที่เพิ่มขึ้น (กก.)
  const weightGainKg =
    (currentWeightGr * fishRemaining - initialWeightGr * fishReleased) / 1000;

  // ถ้าน้ำหนักไม่เพิ่มหรือติดลบ คำนวณ FCR ไม่ได้
  if (weightGainKg <= 0 || totalFoodKg <= 0) return null;

  return totalFoodKg / weightGainKg;
}

// ---------------------------------------------------------------------------
// เกณฑ์การประเมิน (Rating thresholds)
// ---------------------------------------------------------------------------

export type RatingLevel = 'excellent' | 'good' | 'normal' | 'below' | 'critical';

export interface Rating {
  level: RatingLevel;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

/**
 * ประเมินเกณฑ์ GPI
 */
export function getGPIRating(gpi: number): Rating {
  if (gpi >= 110) return { level: 'excellent', label: 'ดีเยี่ยม', color: '#15803d', bgColor: '#dcfce7', icon: '⭐' };
  if (gpi >= 100)  return { level: 'good',    label: 'ดี',     color: '#22c55e', bgColor: '#f0fdf4', icon: '✅' };
  if (gpi >= 90)   return { level: 'normal',  label: 'ปกติ',   color: '#facc15', bgColor: '#fff7ed', icon: '⚠️' };
  if (gpi >= 80)  return { level: 'below',     label: 'ต่ำกว่ามาตรฐาน', color: '#f97316', bgColor: '#fff7ed', icon: '⚠️' };
  return { level: 'critical', label: 'ต้องปรับปรุง', color: '#ef4444', bgColor: '#fef2f2', icon: '🔴' };
}

/**
 * ประเมินเกณฑ์ Survival Rate
 */
export function getSRRating(sr: number): Rating {
  if (sr > 90) return { level: 'excellent', label: 'ดีเยี่ยม', color: '#15803d', bgColor: '#dcfce7', icon: '🌟' };
  if (sr > 80) return { level: 'good', label: 'ดี', color: '#22c55e', bgColor: '#e6f4ea', icon: '✅' };
  if (sr > 70) return { level: 'normal', label: 'พอใช้', color: '#facc15', bgColor: '#fef9c3', icon: '⚠️' };
  return { level: 'critical', label: 'ต้องปรับปรุง', color: '#f97316', bgColor: '#fee2e2', icon: '🔴' };
}

/**
 * ประเมินเกณฑ์ FCR
 */
export function getFCRRating(fcr: number): Rating {
  if (fcr <= 1.5) return { level: 'excellent', label: 'ดีเยี่ยม',   color: '#15803d', bgColor: '#dcfce7', icon: '⭐' };
  if (fcr <= 2.0) return { level: 'good',    label: 'ดี',         color: '#22c55e', bgColor: '#f0fdf4', icon: '✅' };
  if (fcr <= 2.5) return { level: 'normal',    label: 'ปกติ',       color: '#facc15', bgColor: '#fff7ed', icon: '✅' };
  if (fcr <= 3.0) return { level: 'below',     label: 'สูงเกิน',   color: '#f97316', bgColor: '#fff7ed', icon: '⚠️' };
  return { level: 'critical', label: 'สิ้นเปลือง', color: '#ef4444', bgColor: '#fef2f2', icon: '🔴' };
}

// ---------------------------------------------------------------------------
// คะแนนคุณภาพโดยรวม (Overall Quality Stars — 1-5 ดาว)
// ---------------------------------------------------------------------------

/**
 * คำนวณคะแนนดาวรวม (1-5) จากดัชนีทั้งหมด
 *
 * ถ่วงน้ำหนัก:
 *   - GPI  (60%) — ตัวชี้วัดหลัก: ปลาโตได้ดีแค่ไหน
 *   - SR   (25%) — ปลารอดเท่าไหร่
 *   - FCR  (15%) — ใช้อาหารคุ้มแค่ไหน
 *
 * ถ้าไม่มี SR หรือ FCR จะถ่วงน้ำหนักใหม่ตามที่มี
 *
 * @returns { stars, label, description }
 */
export function calculateOverallStars(assessment: QualityAssessment): {
  stars: number;
  label: string;
  description: string;
} {
  // แปลงแต่ละดัชนีเป็นคะแนน 0-5
  const gpiScore = gpiToScore(assessment.gpi);

  let totalWeight = 0;
  let weightedSum = 0;

  // GPI (weight 60)
  weightedSum += gpiScore * 60;
  totalWeight += 60;

  // SR (weight 25) — ถ้ามี
  if (assessment.survivalRate != null) {
    const srScore = srToScore(assessment.survivalRate);
    weightedSum += srScore * 25;
    totalWeight += 25;
  }

  // FCR (weight 15) — ถ้ามี
  if (assessment.fcr != null) {
    const fcrScore = fcrToScore(assessment.fcr);
    weightedSum += fcrScore * 15;
    totalWeight += 15;
  }

  const raw = totalWeight > 0 ? weightedSum / totalWeight : 0;
  // ปัดเป็น 0.5
  const stars = Math.max(0.5, Math.min(5, Math.round(raw * 2) / 2));

  const { label, description } = getStarLabel(stars);

  return { stars, label, description };
}

function gpiToScore(gpi: number): number {
  if (gpi >= 110) return 5;
  if (gpi >= 95) return 4;
  if (gpi >= 80) return 3;
  if (gpi >= 65) return 2;
  return 1;
}

function srToScore(sr: number): number {
  if (sr >= 90) return 5;
  if (sr >= 80) return 4;
  if (sr >= 70) return 3;
  if (sr >= 60) return 2;
  return 1;
}

function fcrToScore(fcr: number): number {
  if (fcr <= 1.3) return 5;
  if (fcr <= 1.5) return 4;
  if (fcr <= 2.0) return 3;
  if (fcr <= 2.5) return 2;
  return 1;
}

function getStarLabel(stars: number): { label: string; description: string } {
  if (stars >= 4.5) return { label: 'ดีเยี่ยม', description: 'การเลี้ยงรอบนี้ได้ผลดีมาก ปลาเจริญเติบโตเกินมาตรฐาน' };
  if (stars >= 3.5) return { label: 'ดี', description: 'การเลี้ยงรอบนี้อยู่ในเกณฑ์ดี ปลาเจริญเติบโตใกล้เคียงมาตรฐาน' };
  if (stars >= 2.5) return { label: 'พอใช้', description: 'การเลี้ยงรอบนี้อยู่ในเกณฑ์พอใช้ ควรติดตามการเจริญเติบโตอย่างใกล้ชิด' };
  if (stars >= 1.5) return { label: 'ต่ำกว่ามาตรฐาน', description: 'ปลาเจริญเติบโตต่ำกว่าที่ควร ควรตรวจสอบอาหารและสภาพบ่อ' };
  return { label: 'ต้องปรับปรุง', description: 'การเลี้ยงรอบนี้มีปัญหา ควรปรึกษาผู้เชี่ยวชาญเพื่อหาสาเหตุ' };
}

// ---------------------------------------------------------------------------
// สรุปภาพรวมรอบการเลี้ยง (Quality Assessment Summary)
// ---------------------------------------------------------------------------

export interface QualityAssessment {
  /** จำนวนวันสำหรับคำนวณ (first record → latest record) */
  totalDays: number;
  /** จำนวนวันที่เลี้ยงนับจากวันปล่อย (สำหรับแสดงผล) */
  daysSinceRelease: number;
  /** วันที่บันทึกครั้งแรก (สำหรับจับคู่กราฟ) */
  firstRecordDate: string;
  /** น้ำหนักเริ่มต้น (กรัม) */
  initialWeightGr: number;
  /** น้ำหนักล่าสุด (กรัม) */
  latestWeightGr: number;
  /** น้ำหนักมาตรฐาน ณ วันล่าสุด (กรัม) */
  standardWeightGr: number;
  /** GPI (%) */
  gpi: number;
  gpiRating: Rating;
  /** ADG จริง (กรัม/วัน) */
  actualADG: number;
  /** ADG มาตรฐาน ณ วันล่าสุด (กรัม/วัน) */
  standardADG: number;
  /** Survival Rate (%) */
  survivalRate: number | null;
  srRating: Rating | null;
  /** FCR */
  fcr: number | null;
  fcrRating: Rating | null;
  /** ค่าใช้จ่าย */
  totalFoodCost: number;
  totalMedicineCost: number;
  totalFoodKg: number;
  totalCost: number;
  costPerFish: number | null;
  costPerKg: number | null;
  /** จำนวนปลา */
  fishReleased: number | null;
  fishRemaining: number | null;
}

export interface RecordEntry {
  recordedAt: string;
  fishAgeDays?: number | null;
  fishReleased?: number | null;
  fishRemaining?: number | null;
  averageFishWeightGr?: number | null;
  foodAmountKg?: number | null;
  foodCostBaht?: number | null;
  medicineCostBaht?: number | null;
}

/**
 * คำนวณ Quality Assessment จาก records ของรอบการเลี้ยง
 *
 * @param records รายการบันทึกข้อมูลรายวัน (เรียงตามวันที่เก่า→ใหม่)
 * @param cycleStartDate วันที่เริ่มรอบ
 * @param initialWeightGr น้ำหนักเริ่มต้นตอนปล่อย (กรัม) — จาก ProductionCycle.initialAvgWeightKg * 1000
 * @param initialStockCount จำนวนปลาที่ปล่อย — จาก ProductionCycle.initialStockCount
 * @returns QualityAssessment หรือ null ถ้าข้อมูลไม่เพียงพอ
 */
export function computeQualityAssessment(
  records: RecordEntry[],
  cycleStartDate: string,
  initialWeightGr: number | null,
  initialStockCount: number | null,
): QualityAssessment | null {
  if (records.length === 0) return null;

  // เรียง records จากเก่าไปใหม่
  const sorted = [...records].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  // หา record ล่าสุดที่มีน้ำหนัก
  const latestWithWeight = [...sorted].reverse().find((r) => r.averageFishWeightGr != null);
  if (!latestWithWeight || latestWithWeight.averageFishWeightGr == null) return null;

  const latestWeightGr = latestWithWeight.averageFishWeightGr;

  // น้ำหนักเริ่มต้น: ใช้จาก ProductionCycle ถ้ามี, ไม่งั้นใช้ record แรกที่มีน้ำหนัก
  const firstWithWeight = sorted.find((r) => r.averageFishWeightGr != null);
  const effectiveInitialWeight =
    initialWeightGr != null && initialWeightGr > 0
      ? initialWeightGr
      : firstWithWeight?.averageFishWeightGr ?? 0;

  if (effectiveInitialWeight <= 0) return null;

  // วันที่บันทึกครั้งแรก (ใช้เป็น day 0 ในการคำนวณ เพราะน้ำหนักแรกบันทึก ณ วันนี้)
  const firstRecordDate = sorted[0].recordedAt;
  const firstDate = new Date(firstRecordDate);
  const latestDate = new Date(latestWithWeight.recordedAt);

  // จำนวนวันสำหรับคำนวณ: first record → latest record (วันแรก = day 0)
  const totalDays = Math.max(0, Math.floor((latestDate.getTime() - firstDate.getTime()) / (24 * 60 * 60 * 1000)));

  // จำนวนวันสำหรับแสดงผล: release date → วันนี้ (วันปล่อย = day 0)
  const releaseDate = new Date(cycleStartDate);
  const now = new Date();
  const daysSinceRelease = Math.max(0, Math.floor((now.getTime() - releaseDate.getTime()) / (24 * 60 * 60 * 1000)));

  // คำนวณดัชนีต่างๆ
  const standardWeightGr = getStandardWeight(effectiveInitialWeight, totalDays);
  const gpi = calculateGPI(latestWeightGr, effectiveInitialWeight, totalDays);
  const actualADG = calculateADG(latestWeightGr, effectiveInitialWeight, totalDays);
  const standardADG = getStandardADG(effectiveInitialWeight, totalDays);

  // หาจำนวนปลา
  const fishReleased = initialStockCount ?? sorted.find((r) => r.fishReleased != null)?.fishReleased ?? null;
  const fishRemaining = [...sorted].reverse().find((r) => r.fishRemaining != null)?.fishRemaining ?? null;

  // Survival Rate
  let survivalRate: number | null = null;
  let srRating: Rating | null = null;
  if (fishReleased != null && fishReleased > 0 && fishRemaining != null) {
    survivalRate = calculateSR(fishRemaining, fishReleased);
    srRating = getSRRating(survivalRate);
  }

  // รวมค่าอาหารและค่ายา
  const totalFoodKg = sorted.reduce((sum, r) => sum + (r.foodAmountKg ?? 0), 0);
  const totalFoodCost = sorted.reduce((sum, r) => sum + (r.foodCostBaht ?? 0), 0);
  const totalMedicineCost = sorted.reduce((sum, r) => sum + (r.medicineCostBaht ?? 0), 0);
  const totalCost = totalFoodCost + totalMedicineCost;

  // FCR
  let fcr: number | null = null;
  let fcrRating: Rating | null = null;
  if (fishReleased != null && fishRemaining != null && totalFoodKg > 0) {
    fcr = calculateFCR(totalFoodKg, latestWeightGr, effectiveInitialWeight, fishReleased, fishRemaining);
    if (fcr != null) {
      fcrRating = getFCRRating(fcr);
    }
  }

  // ต้นทุน
  let costPerFish: number | null = null;
  let costPerKg: number | null = null;
  if (fishRemaining != null && fishRemaining > 0) {
    costPerFish = totalCost / fishRemaining;
    const totalBiomassKg = (latestWeightGr * fishRemaining) / 1000;
    if (totalBiomassKg > 0) {
      costPerKg = totalCost / totalBiomassKg;
    }
  }

  return {
    totalDays,
    daysSinceRelease,
    firstRecordDate,
    initialWeightGr: effectiveInitialWeight,
    latestWeightGr,
    standardWeightGr,
    gpi,
    gpiRating: getGPIRating(gpi),
    actualADG,
    standardADG,
    survivalRate,
    srRating,
    fcr,
    fcrRating,
    totalFoodCost,
    totalMedicineCost,
    totalFoodKg,
    totalCost,
    costPerFish,
    costPerKg,
    fishReleased,
    fishRemaining,
  };
}

// ---------------------------------------------------------------------------
// คำแนะนำการจับ/ส่งต่อปลา (Harvest Advisor)
// ---------------------------------------------------------------------------

export type FarmType = 'SMALL' | 'LARGE' | 'MARKET';

/**
 * ช่วงน้ำหนักของปลาแต่ละระยะ (กรัม)
 *
 * ปลาตุ้ม (SMALL)  : 0.5 - 5 กรัม   → เลี้ยง 7-10 วัน แล้วส่งต่อเป็นปลานิ้ว
 * ปลานิ้ว (LARGE)  : 5 - 30 กรัม    → เลี้ยง 11-30 วัน แล้วส่งต่อเป็นปลาตลาด
 * ปลาตลาด (MARKET) : >30 กรัม       → เลี้ยง 31-180 วัน จนถึงขนาดจับขาย
 */
export const STAGE_WEIGHT_RANGES = {
  SMALL: { minGr: 0.5, maxGr: 5, label: 'ปลาตุ้ม', nextStage: 'ปลานิ้ว', nextFarmType: 'LARGE' as FarmType },
  LARGE: { minGr: 5, maxGr: 30, label: 'ปลานิ้ว', nextStage: 'ปลาตลาด', nextFarmType: 'MARKET' as FarmType },
  MARKET: { minGr: 30, maxGr: null, label: 'ปลาตลาด', nextStage: null, nextFarmType: null },
} as const;

/**
 * ขนาดตลาดสำหรับปลาดุกบิ๊กอุย (เฉพาะ MARKET)
 */
export const MARKET_SIZES = {
  /** ขนาดส่งตลาดทั่วไป (กรัม/ตัว) */
  GENERAL_MIN: 150,
  GENERAL_MAX: 200,
  /** ขนาดพรีเมียม (กรัม/ตัว) */
  PREMIUM_MIN: 500,
  PREMIUM_MAX: 1000,
} as const;

export type HarvestReadiness =
  | 'not-ready'
  | 'approaching'
  | 'ready-transfer'     // สำหรับ SMALL/LARGE → พร้อมส่งต่อ
  | 'ready-general'      // สำหรับ MARKET → ถึงขนาดตลาดทั่วไป
  | 'ready-premium'      // สำหรับ MARKET → ถึงขนาดพรีเมียม
  | 'optimal-sell';      // แนะนำจับ/ส่งต่อเลย

export interface HarvestSignal {
  key: string;
  type: 'positive' | 'warning' | 'critical' | 'info';
  title: string;
  detail: string;
}

export interface HarvestAdvice {
  /** ประเภทฟาร์ม */
  farmType: FarmType;
  /** ความพร้อมในการจับ/ส่งต่อ */
  readiness: HarvestReadiness;
  /** label สำหรับแสดง */
  readinessLabel: string;
  /** คำอธิบายสถานะ */
  description: string;
  /** สีหลัก */
  color: string;
  bgColor: string;
  /** เปอร์เซ็นต์เข้าใกล้เป้าหมาย (0-100+) */
  marketProgressPct: number;
  /** สัญญาณต่างๆ ที่ตรวจพบ */
  signals: HarvestSignal[];
  /** เป้าหมายถัดไป */
  nextTarget: { label: string; weightGr: number } | null;
  /** จำนวนวันที่คาดว่าจะถึงเป้าหมาย (ประมาณ) */
  estimatedDaysToTarget: number | null;
  /** ผลผลิตรวมโดยประมาณ (กก.) */
  estimatedYieldKg: number | null;
  /** มูลค่าโดยประมาณ (บาท) — ราคาปลาดุก ~40-60 บาท/กก. */
  estimatedRevenue: { min: number; max: number } | null;
  /** กำไรขาดทุนโดยประมาณ */
  estimatedProfit: { min: number; max: number } | null;
  /** ข้อมูล progress bar */
  progressBar: {
    /** markers บน progress bar */
    markers: { label: string; weightGr: number; color: string }[];
    /** ขอบเขตสูงสุดของ bar */
    scaleMaxGr: number;
  };
}

/**
 * ข้อมูลขั้นต่ำที่ต้องใช้ในการคำนวณคำแนะนำการจับ/ส่งต่อปลา
 * ใช้ได้ทั้งจาก QualityAssessment (มีครบ) และจาก dashboard summary (มีบางส่วน)
 */
export interface HarvestInput {
  latestWeightGr: number;
  totalDays: number;
  actualADG: number;
  fcr: number | null;
  fishRemaining: number | null;
  totalCost: number;
}

/**
 * คำนวณคำแนะนำการจับ/ส่งต่อปลาจาก HarvestInput + farmType
 */
export function computeHarvestAdvice(
  input: HarvestInput,
  farmType: FarmType,
): HarvestAdvice {
  const {
    latestWeightGr,
    totalDays,
    actualADG,
    fcr,
    fishRemaining,
    totalCost,
  } = input;

  const stage = STAGE_WEIGHT_RANGES[farmType];
  const signals: HarvestSignal[] = [];

  // ────────────────────────────────────────────────────────────
  // SMALL / LARGE — เป้าหมายคือ "ส่งต่อ" ไม่ใช่ "ขาย"
  // ────────────────────────────────────────────────────────────
  if (farmType === 'SMALL' || farmType === 'LARGE') {
    const targetWeight = stage.maxGr!; // SMALL=5, LARGE=30 — always defined for these types
    const progressPct = Math.min(100, (latestWeightGr / targetWeight) * 100);
    const isReady = latestWeightGr >= targetWeight;
    const isApproaching = progressPct >= 70;

    // สัญญาณน้ำหนัก
    if (isReady) {
      signals.push({
        key: 'weight-ready',
        type: 'positive',
        title: `ถึงขนาด${stage.nextStage}แล้ว`,
        detail: `น้ำหนัก ${latestWeightGr.toFixed(1)} ก. ≥ ${targetWeight} ก. พร้อมส่งต่อไปเลี้ยงเป็น${stage.nextStage}`,
      });
    }

    // สัญญาณจำนวนวัน (สำหรับ SMALL: 7-10 วัน, LARGE: 11-30 วัน)
    const maxDays = farmType === 'SMALL' ? 10 : 30;
    if (totalDays >= maxDays && !isReady) {
      signals.push({
        key: 'days-exceeded',
        type: 'warning',
        title: 'เลี้ยงเกินระยะเวลาปกติ',
        detail: `เลี้ยงมาแล้ว ${totalDays} วัน (ปกติ ${stage.label} ≤${maxDays} วัน) ปลาอาจโตช้ากว่าที่ควร`,
      });
    }

    // เป้าหมาย
    let nextTarget: { label: string; weightGr: number } | null = null;
    let estimatedDaysToTarget: number | null = null;

    if (!isReady) {
      nextTarget = { label: `ส่งต่อเป็น${stage.nextStage}`, weightGr: targetWeight };
      if (actualADG > 0) {
        estimatedDaysToTarget = Math.ceil((targetWeight - latestWeightGr) / actualADG);
      }
    }

    // สรุปสถานะ
    let readiness: HarvestReadiness;
    let readinessLabel: string;
    let description: string;
    let color: string;
    let bgColor: string;

    if (isReady && totalDays >= maxDays) {
      readiness = 'optimal-sell';
      readinessLabel = `แนะนำส่งต่อเป็น${stage.nextStage}`;
      description = `ปลาถึงขนาด${stage.nextStage}แล้ว และเลี้ยงมาครบระยะ ควรส่งต่อไปฟาร์ม${stage.nextStage}`;
      color = '#dc2626';
      bgColor = '#fef2f2';
    } else if (isReady) {
      readiness = 'ready-transfer';
      readinessLabel = `พร้อมส่งต่อเป็น${stage.nextStage}`;
      description = `ปลาถึงน้ำหนัก ${targetWeight} ก. แล้ว สามารถส่งต่อไปเลี้ยงเป็น${stage.nextStage}ได้`;
      color = '#22c55e';
      bgColor = '#f0fdf4';
    } else if (isApproaching) {
      readiness = 'approaching';
      readinessLabel = `ใกล้ถึงขนาด${stage.nextStage}`;
      description = `ปลากำลังใกล้ขนาด${stage.nextStage} เลี้ยงต่ออีกนิด`;
      color = '#f59e0b';
      bgColor = '#fffbeb';
    } else {
      readiness = 'not-ready';
      readinessLabel = `กำลังเลี้ยง${stage.label}`;
      description = `ปลายังอยู่ในระยะ${stage.label} ต้องเลี้ยงต่อให้ถึงขนาด${stage.nextStage}`;
      color = '#6b7280';
      bgColor = '#f9fafb';
    }

    return {
      farmType,
      readiness,
      readinessLabel,
      description,
      color,
      bgColor,
      marketProgressPct: progressPct,
      signals,
      nextTarget,
      estimatedDaysToTarget,
      estimatedYieldKg: fishRemaining != null ? (latestWeightGr * fishRemaining) / 1000 : null,
      estimatedRevenue: null, // ไม่ขายตรง
      estimatedProfit: null,
      progressBar: {
        markers: [
          { label: `${stage.nextStage} (${targetWeight} ก.)`, weightGr: targetWeight, color: '#22c55e' },
        ],
        scaleMaxGr: Math.max(targetWeight * 1.3, latestWeightGr * 1.15),
      },
    };
  }

  // ────────────────────────────────────────────────────────────
  // MARKET — เป้าหมายคือ "จับขาย"
  // ────────────────────────────────────────────────────────────
  const generalPct = Math.min(100, (latestWeightGr / MARKET_SIZES.GENERAL_MIN) * 100);
  const premiumPct = Math.min(100, (latestWeightGr / MARKET_SIZES.PREMIUM_MIN) * 100);

  const isGeneralReady = latestWeightGr >= MARKET_SIZES.GENERAL_MIN;
  const isPremiumReady = latestWeightGr >= MARKET_SIZES.PREMIUM_MIN;

  if (isPremiumReady) {
    signals.push({
      key: 'weight-premium',
      type: 'positive',
      title: 'ถึงขนาดพรีเมียม',
      detail: `น้ำหนัก ${latestWeightGr.toFixed(0)} ก. ≥ ${MARKET_SIZES.PREMIUM_MIN} ก. เหมาะขายราคาพิเศษ`,
    });
  } else if (isGeneralReady) {
    signals.push({
      key: 'weight-general',
      type: 'positive',
      title: 'ถึงขนาดตลาดทั่วไป',
      detail: `น้ำหนัก ${latestWeightGr.toFixed(0)} ก. พร้อมส่งตลาดได้`,
    });
  }

  // FCR
  if (fcr != null) {
    if (fcr > 2.5) {
      signals.push({
        key: 'fcr-high',
        type: 'critical',
        title: 'FCR สูงมาก — สิ้นเปลืองอาหาร',
        detail: `FCR ${fcr.toFixed(2)} หมายถึงใช้อาหาร ${fcr.toFixed(1)} กก. ต่อเนื้อปลา 1 กก. ยิ่งเลี้ยงต่อยิ่งไม่คุ้ม`,
      });
    } else if (fcr > 2.0) {
      signals.push({
        key: 'fcr-warning',
        type: 'warning',
        title: 'FCR เริ่มสูง — ต้นทุนเพิ่มขึ้น',
        detail: `FCR ${fcr.toFixed(2)} สูงกว่าปกติ ควรพิจารณาจับหรือปรับอาหาร`,
      });
    } else if (fcr <= 1.5) {
      signals.push({
        key: 'fcr-good',
        type: 'positive',
        title: 'FCR ดี — ยังคุ้มค่าอาหาร',
        detail: `FCR ${fcr.toFixed(2)} ปลาแปลงอาหารเป็นเนื้อได้ดี ยังเลี้ยงต่อได้`,
      });
    }
  }

  // ADG
  if (totalDays > 0 && actualADG > 0) {
    if (actualADG < 1.0 && totalDays >= 60) {
      signals.push({
        key: 'adg-slow',
        type: 'warning',
        title: 'ปลาโตช้า — ADG ต่ำ',
        detail: `ADG ${actualADG.toFixed(2)} ก./วัน เลี้ยงต่อจะนาน ต้นทุนเพิ่ม`,
      });
    }
  }

  // จำนวนวัน
  if (totalDays >= 150) {
    signals.push({
      key: 'days-long',
      type: 'warning',
      title: 'เลี้ยงมานาน',
      detail: `เลี้ยงมาแล้ว ${totalDays} วัน ปลาดุกทั่วไปเลี้ยง 90-150 วัน ยิ่งนานยิ่งเปลืองต้นทุน`,
    });
  }

  // ผลผลิตและมูลค่า
  let estimatedYieldKg: number | null = null;
  let estimatedRevenue: { min: number; max: number } | null = null;
  let estimatedProfit: { min: number; max: number } | null = null;

  if (fishRemaining != null && fishRemaining > 0) {
    estimatedYieldKg = (latestWeightGr * fishRemaining) / 1000;
    estimatedRevenue = {
      min: estimatedYieldKg * 40,
      max: estimatedYieldKg * 60,
    };
    estimatedProfit = {
      min: estimatedRevenue.min - totalCost,
      max: estimatedRevenue.max - totalCost,
    };
  }

  // เป้าหมาย
  let nextTarget: { label: string; weightGr: number } | null = null;
  let estimatedDaysToTarget: number | null = null;

  if (!isGeneralReady) {
    nextTarget = { label: 'ตลาดทั่วไป', weightGr: MARKET_SIZES.GENERAL_MIN };
  } else if (!isPremiumReady) {
    nextTarget = { label: 'ขนาดพรีเมียม', weightGr: MARKET_SIZES.PREMIUM_MIN };
  }

  if (nextTarget && actualADG > 0) {
    const remainGr = nextTarget.weightGr - latestWeightGr;
    estimatedDaysToTarget = Math.ceil(remainGr / actualADG);
  }

  // สรุปสถานะ
  let readiness: HarvestReadiness;
  let readinessLabel: string;
  let description: string;
  let color: string;
  let bgColor: string;

  const shouldSellNow = isGeneralReady && fcr != null && fcr > 2.0;

  if (shouldSellNow) {
    readiness = 'optimal-sell';
    readinessLabel = 'แนะนำจับขาย';
    description = 'ปลาถึงขนาดตลาดแล้ว และ FCR สูงขึ้น ยิ่งเลี้ยงต่อยิ่งเปลืองอาหาร ควรจับขายช่วงนี้';
    color = '#dc2626';
    bgColor = '#fef2f2';
  } else if (isPremiumReady) {
    readiness = 'ready-premium';
    readinessLabel = 'พร้อมจับ (พรีเมียม)';
    description = 'ปลาถึงขนาดพรีเมียม สามารถขายได้ราคาดี หรือเลี้ยงต่อให้ใหญ่ขึ้นได้ถ้า FCR ยังดี';
    color = '#15803d';
    bgColor = '#f0fdf4';
  } else if (isGeneralReady) {
    readiness = 'ready-general';
    readinessLabel = 'พร้อมจับ (ตลาดทั่วไป)';
    description = 'ปลาถึงขนาดส่งตลาดทั่วไปแล้ว จับขายได้เลย หรือเลี้ยงต่อเพื่อขนาดพรีเมียม';
    color = '#22c55e';
    bgColor = '#f0fdf4';
  } else if (generalPct >= 70) {
    readiness = 'approaching';
    readinessLabel = 'ใกล้ถึงขนาดตลาด';
    description = 'ปลากำลังใกล้ถึงขนาดตลาด เลี้ยงต่ออีกไม่นาน';
    color = '#f59e0b';
    bgColor = '#fffbeb';
  } else {
    readiness = 'not-ready';
    readinessLabel = 'ยังไม่ถึงขนาดตลาด';
    description = 'ปลายังเล็กอยู่ ต้องเลี้ยงต่อให้ถึงขนาดตลาด';
    color = '#6b7280';
    bgColor = '#f9fafb';
  }

  return {
    farmType,
    readiness,
    readinessLabel,
    description,
    color,
    bgColor,
    marketProgressPct: isGeneralReady ? premiumPct : generalPct,
    signals,
    nextTarget,
    estimatedDaysToTarget,
    estimatedYieldKg,
    estimatedRevenue,
    estimatedProfit,
    progressBar: {
      markers: [
        { label: `ตลาดทั่วไป (${MARKET_SIZES.GENERAL_MIN} ก.)`, weightGr: MARKET_SIZES.GENERAL_MIN, color: '#22c55e' },
        { label: `พรีเมียม (${MARKET_SIZES.PREMIUM_MIN} ก.)`, weightGr: MARKET_SIZES.PREMIUM_MIN, color: '#7c3aed' },
      ],
      scaleMaxGr: Math.max(MARKET_SIZES.PREMIUM_MIN, latestWeightGr * 1.15),
    },
  };
}
