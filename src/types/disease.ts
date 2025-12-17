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