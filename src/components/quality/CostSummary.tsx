/**
 * CostSummary — สรุปค่าใช้จ่ายรอบการเลี้ยง
 *
 * แสดงผล:
 * - ค่าอาหารรวม
 * - ค่ายารวม
 * - อาหารที่ใช้ทั้งหมด (กก.)
 * - ต้นทุนรวม
 * - ต้นทุน/ตัว
 * - ต้นทุน/กก. ผลผลิต
 */
"use client";

import type { QualityAssessment } from "@/utils/catfishGrowth";

interface Props {
  assessment: QualityAssessment;
}

function Row({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${highlight ? "" : "border-b border-gray-100"}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className={`text-xs ${highlight ? "font-bold text-[#093832]" : "font-semibold text-gray-600"}`}>
          {label}
        </span>
      </div>
      <span className={`text-sm ${highlight ? "font-black text-[#093832]" : "font-bold text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}

export default function CostSummary({ assessment }: Props) {
  const {
    totalFoodCost,
    totalMedicineCost,
    totalFoodKg,
    totalCost,
    costPerFish,
    costPerKg,
  } = assessment;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💰</span>
        <h3 className="text-sm font-bold text-[#093832]">สรุปค่าใช้จ่ายรอบการเลี้ยง</h3>
      </div>

      <div className="px-1">
        <Row
          icon="🍚"
          label="ค่าอาหารรวม"
          value={`${totalFoodCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ฿`}
        />
        <Row
          icon="💊"
          label="ค่ายารวม"
          value={`${totalMedicineCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ฿`}
        />
        <Row
          icon="📦"
          label="อาหารที่ใช้ทั้งหมด"
          value={`${totalFoodKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} กก.`}
        />

        {/* เส้นแบ่ง */}
        <div className="border-t-2 border-[#093832]/10 my-2" />

        <Row
          icon="💵"
          label="ต้นทุนรวม (อาหาร+ยา)"
          value={`${totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ฿`}
          highlight
        />
        <Row
          icon="🐟"
          label="ต้นทุน/ตัว (คงเหลือ)"
          value={costPerFish != null ? `${costPerFish.toFixed(2)} ฿` : "-"}
        />
        <Row
          icon="⚖️"
          label="ต้นทุน/กก. ผลผลิต"
          value={costPerKg != null ? `${costPerKg.toFixed(1)} ฿` : "-"}
          highlight
        />
      </div>
    </div>
  );
}
