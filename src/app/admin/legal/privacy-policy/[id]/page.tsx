"use client";

import React from "react";
import { useParams } from "next/navigation";
import { LegalDocumentVersionDetail } from "@/components/page/LegalDocuments";

export default function PrivacyPolicyVersionDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  return <LegalDocumentVersionDetail type="privacy-policy" id={id} />;
}
