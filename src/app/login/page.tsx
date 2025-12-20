"use client";

import Image from "next/image";

export default function LoginPage() {

  const handleLineLogin = async (role: string) => {
    try {
      // ตาม API spec: GET /auth/line/login?role=farmer|researcher
      const response = await fetch(`https://dukefarm-backend.onrender.com/api/auth/line/login?role=${role.toLowerCase()}`);
      const data = await response.json();

      // Response: { "url": "https://access.line.me/oauth2/..." }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1/2">
        <Image
          src="/login/bg-farm2.png"
          alt="Farm Background"
          fill
          priority
          className=""
        />
        <div className="absolute inset-0 bg-white/10"></div>
      </div>
      {/* Content Container */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-sm mx-auto mt-40">
          {/* Top Message */}
          <div className="px-6 py-3 mb-4 mx-auto w-fit relative -top-12 z-10">
            <Image
              src="/login/text.png"
              alt="Top Message"
              width={250}
              height={50}
              className="object-contain"
              style={{ height: "auto" }}
            />
          </div>

          {/* Duck Character */}
          <div className="absolute -right-32 -top-12 z-0 hidden md:block">
            <Image
              src="/login/duke-character.png"
              alt="Duke Character"
              width={180}
              height={180}
              className="drop-shadow-lg"
              style={{ height: "auto" }}
            />
          </div>
          <div className="absolute -right-12 -top-10 z-0 md:hidden">
            <Image
              src="/login/duke-character.png"
              alt="Duke Character"
              width={100}
              height={100}
              className="drop-shadow-lg"
              style={{ height: "auto" }}
            />
          </div>

          {/* Main Content Card */}
          <div className=" overflow-hidden">
            {/* Logo Section */}
            <div className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Image
                  src="/login/duke-logo.png"
                  alt="Duke Farm Logo"
                  width={200}
                  height={80}
                  className="mx-auto"
                  style={{ height: "auto" }}
                />
              </div>
              <p className="text-emerald-600 font-medium text-lg">CatFish Farm Management</p>
            </div>

            {/* Login Button */}
            <div className="px-4 pt-0 space-y-4">
              <button
                onClick={() => handleLineLogin("researcher")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-medium text-lg transition-colors shadow-lg"
              >
                ทีมวิจัย
              </button>
              <button
                onClick={() => handleLineLogin("farmer")}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-medium text-lg transition-colors shadow-lg"
              >
                เกษตรกร
              </button>
            </div>
          </div>

          {/* Partner Logos */}
          <div className="mt-4 flex justify-center items-center space-x-3">
            <div className=" p-2">
              <Image
                src="/login/partnerKU.png"
                alt="KU"
                width={40}
                height={25}
                className="object-contain"
                style={{ height: "auto" }}
              />
            </div>
            <div className=" p-2">
              <Image
                src="/login/partnerBTG.png"
                alt="BETACRO"
                width={40}
                height={25}
                className="object-contain"
                style={{ height: "auto" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}