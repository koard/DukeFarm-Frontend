import { useState, useEffect } from "react";

interface LineUser {
  displayName: string;
  pictureUrl: string;
}

export function useLineUser() {
  const [lineUser, setLineUser] = useState<LineUser>({
    displayName: "ผู้ใช้",
    pictureUrl: "https://placehold.co/400x400.png?text=Profile"
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setLineUser({
          displayName: userData.displayName || "ผู้ใช้",
          pictureUrl: userData.pictureUrl || "https://placehold.co/400x400.png?text=Profile"
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return lineUser;
}
