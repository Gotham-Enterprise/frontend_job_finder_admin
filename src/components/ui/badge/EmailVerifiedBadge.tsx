import React from "react";
import StatusBadge from "./StatusBadge";

interface EmailVerifiedBadgeProps {
  verified: boolean;
  className?: string;
}

const EmailVerifiedBadge: React.FC<EmailVerifiedBadgeProps> = ({
  verified,
  className = "",
}) => {
  return (
    <StatusBadge tone={verified ? "dark" : "light"} className={className}>
      {verified ? "Verified" : "Unverified"}
    </StatusBadge>
  );
};

export default EmailVerifiedBadge;
