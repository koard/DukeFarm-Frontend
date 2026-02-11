'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecordListStep } from './steps/RecordListStep';
import { RecordEntryStep } from './steps/RecordEntryStep';
import { RecordAnalysisStep } from './steps/RecordAnalysisStep';

type FarmType = 'SMALL' | 'LARGE' | 'MARKET';

export type RecordEntryFormProps = {
  farmType: FarmType;
  backHref: string;
};

export const RecordEntryForm = ({ farmType, backHref }: RecordEntryFormProps) => {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  const handleAddNew = () => setCurrentStep(2);
  
  const handleViewDetails = (id: number) => {
    setSelectedRecordId(id);
    setCurrentStep(3); 
  };

  const handleAnalyze = () => setCurrentStep(3);
  const handleBackToList = () => {
    setSelectedRecordId(null);
    setCurrentStep(1);
  };
  const handleBackToDashboard = () => router.push(backHref);

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

      {/* หน้าที่ 2: กรอกข้อมูล (กรอกข้อมูล01) */}
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