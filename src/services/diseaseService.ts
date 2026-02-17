import { API_BASE_URL } from '@/config/api';

export interface DiseaseTag {
  id: string;
  label: string;
}

export interface Disease {
  id: string;
  name: string;
  category: string;
  icon: string;
  symptoms: string;
  causes: string;
  treatment: string;
  prevention: string;
  treatmentSummary?: string;
  tags?: DiseaseTag[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DiseaseResponse {
  data: {
    data: Disease[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}



export const fetchDiseases = async (params: {
  symptoms?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<DiseaseResponse> => {
  try {
    const url = new URL(`${API_BASE_URL}/diseases`);

    if (params.symptoms) url.searchParams.append('symptoms', params.symptoms);
    if (params.category && params.category !== 'ทั้งหมด') url.searchParams.append('category', params.category);
    if (params.page) url.searchParams.append('page', params.page.toString());
    if (params.limit) url.searchParams.append('limit', params.limit.toString());

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch diseases');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching diseases:', error);
    throw error;
  }
};