export interface AnalyzeResult {
  requestId: string;
  photoPath?: string | null;
  symptomText?: string;
  symptomTags?: string[];
  results: {
    diseaseId: string;
    name: string;
    category: string;
    icon: string;
    treatmentSummary?: string;
    score: number;
    rank: number;
    symptoms: string;
    causes: string;
    treatment: string;
    prevention: string;
  }[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dukefarm-backend.onrender.com/api';

export const diseaseAnalyzerService = {
  // 1. ดึงรายการ Symptom Chips
  getSymptoms: async (): Promise<string[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/symptoms`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error(`Error fetching symptoms: ${res.status}`);
      const responseData = await res.json();
      return responseData.data || [];
    } catch (error) {
      console.error("Get Symptoms Service Error:", error);
      throw error;
    }
  },

  // 2. ส่งวิเคราะห์โรค
  analyzeDisease: async (formData: FormData): Promise<AnalyzeResult> => {
    try {
      const res = await fetch(`${API_BASE_URL}/disease-analyzer`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        let errorMessage = `Error ${res.status}: ${res.statusText}`;
        try {
          if (contentType && contentType.includes("application/json")) {
            const errorJson = await res.json();
            errorMessage = errorJson.message || JSON.stringify(errorJson);
          } else {
            const txt = await res.text();
            if (txt) errorMessage = txt;
          }
        } catch (e) { }
        console.error("🔴 Backend Error Details:", errorMessage);
        throw new Error(errorMessage);
      }

      const responseData = await res.json();
      return responseData.data;
    } catch (error) {
      console.error("Analyze Disease Service Error:", error);
      throw error;
    }
  },

  // 3. ดึงผลลัพธ์การวิเคราะห์ (Mapping ข้อมูลให้ครบ)
  getAnalysisResult: async (id: string): Promise<AnalyzeResult> => {
    try {
      const res = await fetch(`${API_BASE_URL}/disease-analyzer/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error(`Error fetching result: ${res.status}`);

      const responseData = await res.json();
      const rawData = responseData.data;

      const mappedResults = (rawData.matches || []).map((item: any) => ({
        diseaseId: item.diseaseId || item.disease?.id,
        name: item.disease?.name || "ไม่ระบุชื่อโรค",
        category: item.disease?.category || "ทั่วไป",
        icon: item.disease?.icon || "🦠",
        treatmentSummary: item.disease?.treatmentSummary,
        score: item.score,
        rank: item.rank,
        symptoms: item.disease?.symptoms || "",
        causes: item.disease?.causes || "",
        treatment: item.disease?.treatment || "",
        prevention: item.disease?.prevention || ""
      }));

      return {
        requestId: rawData.requestId,
        photoPath: rawData.photoPath,
        symptomText: rawData.symptomText,
        symptomTags: rawData.symptomTags,
        results: mappedResults
      };

    } catch (error) {
      console.error("Get Result Service Error:", error);
      throw error;
    }
  }
};