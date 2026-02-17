"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  vacancy: string;
  affiliation: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    vacancy: "",
    affiliation: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  // เช็คว่ามี token หรือไม่ ถ้าไม่มีให้กลับไปหน้า login
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // แสดง modal ยืนยันและเริ่ม countdown
    setShowModal(true);
    setCountdown(5);
  };

  const handleConfirmRegistration = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");
        router.push("/login");
        return;
      }

      // ตาม API spec: POST /register/researcher
      const requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phoneNumber,
        organization: formData.affiliation,
        department: "", // optional
        jobTitle: formData.vacancy
      };

      console.log("Sending researcher registration:", requestBody);

      const response = await fetch(`${API_BASE_URL}/register/researcher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
        throw new Error(errorData.message || "ไม่สามารถบันทึกข้อมูลได้");
      }

      const result = await response.json();
      console.log("✅ Researcher registration successful:", result);

      // ตาม API spec response: { data: { profile: {...}, user: {...} } }
      if (result.data) {
        const { user, profile } = result.data;

        const currentUserStr = localStorage.getItem("user");
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};

        const updatedUser = {
          ...currentUser,
          role: user.role,
          registrationStatus: user.registrationStatus,
          researcherProfile: profile // เก็บ profile เต็มจาก backend
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        console.log("✅ User data updated in localStorage:", updatedUser);
      }

      setShowModal(false);
      router.push("/dashboard");

    } catch (error) {
      console.error("❌ Registration error:", error);
      setShowModal(false);
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง");
    }
  }, [router, formData]);

  // Auto close modal after countdown
  useEffect(() => {
    if (showModal && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (showModal && countdown === 0) {
      handleConfirmRegistration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, countdown]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#065f46] text-white px-6 pt-5 pb-4 rounded-b-3xl flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-emerald-600 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-lg font-medium">กรอกข้อมูลลงทะเบียน</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ชื่อ */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">ชื่อ</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              placeholder="กรอกชื่อ"
              required
            />
          </div>

          {/* นามสกุล */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">นามสกุล</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              placeholder="กรอกนามสกุล"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">อีเมล</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              placeholder="กรอกอีเมล"
              required
            />
          </div>

          {/* เบอร์โทรศัพท์ */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              placeholder="กรอกเบอร์โทรศัพท์"
              required
            />
          </div>
          {/*ตำแหน่ง*/}
          <div>
            <label className="block text-gray-700 font-medium mb-2">ตำแหน่ง</label>
            <input
              type="text"
              value={formData.vacancy}
              onChange={(e) => handleInputChange("vacancy", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              placeholder="กรอกตำแหน่ง"
              required
            />
          </div>

          {/*สังกัด*/}
          <div>
            <label className="block text-gray-700 font-medium mb-2">สังกัด</label>
            <input
              type="text"
              value={formData.affiliation}
              onChange={(e) => handleInputChange("affiliation", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              placeholder="กรอกสังกัด"
              required
            />
          </div>

          {/* ปุ่มลงทะเบียน */}
          <button
            type="submit"
            className="w-full bg-[#72B544] hover:bg-emerald-600 text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors shadow-lg"
          >
            ลงทะเบียน
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto border-2 border-emerald-500">
            {/* Header */}
            <div className="text-center pt-6 pb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                ลงทะเบียนสำเร็จ
              </h3>
            </div>

            {/* Success Icon */}
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-700 rounded-full mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="px-8">
                <p className="text-gray-600 text-center leading-relaxed">
                  ข้อมูลของคุณได้ถูกบันทึกเรียบร้อยแล้ว
                </p>
                <p className="text-gray-600 text-center leading-relaxed">
                  ระบบจะพาคุณไปหน้าหลัก <span className="font-medium text-emerald-700">ภายใน {countdown} วินาที</span>
                </p>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="px-8 pb-8">
              <button
                onClick={handleConfirmRegistration}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                ลงทะเบียน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
