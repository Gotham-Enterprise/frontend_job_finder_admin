export interface NewsletterTemplate {
  id: string;
  name: string;
  category: "engagement" | "welcome" | "event" | "product" | "newsletter" | "ecommerce" | "saved";
  thumbnail: string;
  description: string;
  content: string;
  design?: any; // Email editor design JSON for loading into the editor
  isCustom?: boolean;
  isSaved?: boolean;
}

export interface NewsletterData {
  subject: string;
  fromName: string;
  fromAddress: string;
  sendTo: string[];
  dontSendTo: string[];
  status: "DRAFT" | "SCHEDULED" | "SENT" | "ARCHIVED";
  scheduledAt?: string;
  scheduledTimezone?: string;
  isTemplate: boolean;
  content: string;
  design?: any; // Store the email editor design JSON
}

export interface NewsletterStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export type NewsletterStepType = "template" | "edit" | "inbox" | "send" | "schedule";
