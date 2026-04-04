"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface BrandingContextType {
  siteName: string;
  coachName: string;
  loading: boolean;
}

const BrandingContext = createContext<BrandingContextType>({
  siteName: "Level Up",
  coachName: "Coach Raheel",
  loading: true,
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [siteName, setSiteName] = useState("Level Up");
  const [coachName, setCoachName] = useState("Coach Raheel");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.site_name) setSiteName(data.site_name);
        if (data.coach_name) setCoachName(data.coach_name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <BrandingContext.Provider value={{ siteName, coachName, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
