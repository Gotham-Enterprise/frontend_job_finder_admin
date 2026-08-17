"use client";

import { FC } from "react";

import { ErrorState } from "@/components/common";
import BackToListButton from "@/components/ui/BackToListButton";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";
import { useGetDocumentVerificationDetails } from "@/services/hooks/useDocumentVerification";
import { DocumentVerificationKind } from "@/services/types/documentVerification";

import { DetailWrapper } from "./components";

interface Props {
  kind: string;
  id: string;
}

const isValidKind = (kind: string): kind is DocumentVerificationKind =>
  kind === "walletCredential" || kind === "education";

const ViewDetails: FC<Props> = ({ kind, id }) => {
  const validKind = isValidKind(kind) ? kind : "walletCredential";
  const { data, isLoading, error } = useGetDocumentVerificationDetails(validKind, id);

  if (!isValidKind(kind)) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/document-verifications" className="mb-6" preserveState={true}>
          Back to Document Verifications
        </BackToListButton>
        <ErrorState message="Invalid document type." />
      </div>
    );
  }

  if (isLoading) {
    return <FullScreenSpinner isVisible={true} message="Loading document verification details..." />;
  }

  if (error) {
    return (
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/document-verifications" className="mb-6" preserveState={true}>
          Back to Document Verifications
        </BackToListButton>
        <ErrorState message={`Error loading document verification details: ${error.message}`} />
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <BackToListButton href="/admin/document-verifications" preserveState={true}>
          Back to Document Verifications
        </BackToListButton>
      </div>
      {data && <DetailWrapper data={data} />}
    </>
  );
};

export default ViewDetails;
