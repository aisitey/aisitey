"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("aisitey-wizard-step");
    localStorage.removeItem("aisitey-wizard-data");
    localStorage.removeItem("aisitey-wizard-project-id");
    localStorage.removeItem("aisitey-wizard-completed-files");

    router.replace("/dashboard/new-project/wizard");
  }, [router]);

  return null;
}