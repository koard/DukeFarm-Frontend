'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecordListStep } from './steps/RecordListStep';
import { RecordEntryStep } from './steps/RecordEntryStep';
import { RecordAnalysisStep } from './steps/RecordAnalysisStep';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dukefarm-backend.onrender.com/api";

type FarmType = 'SMALL' | 'LARGE' | 'MARKET';

export type RecordEntryFormProps = {
  farmType: FarmType;
  backHref: string;
};

export const RecordEntryForm = ({ farmType, backHref }: RecordEntryFormProps) => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number | null>(null); // null = loading
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // On mount, check if records exist. If yes → list (step 1), if no → entry form (step 2)
  useEffect(() => {
    const checkRecords = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setCurrentStep(2);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/records?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const result = await res.json();
          const hasRecords = result.data && result.data.length > 0;
          setCurrentStep(hasRecords ? 1 : 2);
        } else {
          setCurrentStep(2);
        }
      } catch {
        setCurrentStep(2);
      }
    };

    checkRecords();
  }, [farmType]);

  const handleAddNew = () => setCurrentStep(2);

  const handleViewDetails = (id: string) => {
    setSelectedRecordId(id);
    setCurrentStep(3);
  };

  const handleAnalyze = () => setCurrentStep(3);
  const handleBackToList = () => {
    setSelectedRecordId(null);
    setCurrentStep(1);
  };
  const handleBackToDashboard = () => router.push(backHref);

  if (currentStep === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-[#0F3B35] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* หน้าที่ 1: รายการบันทึกข้อมูล */}
      {currentStep === 1 && (
        <RecordListStep
          onAddNew={handleAddNew}
          onViewDetails={handleViewDetails}
          onBack={handleBackToDashboard}
        />
      )}

      {/* หน้าที่ 2: กรอกข้อมูล */}
      {currentStep === 2 && (
        <RecordEntryStep
          onAnalyze={handleAnalyze}
          onBack={handleBackToList}
        />
      )}

      {/* หน้าที่ 3: ผลวิเคราะห์ */}
      {currentStep === 3 && (
        <RecordAnalysisStep
          onClose={handleBackToList}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};