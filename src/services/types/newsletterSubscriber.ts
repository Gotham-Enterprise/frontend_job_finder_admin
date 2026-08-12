export interface NewsletterSubscriber {
  id: string;
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  occupation: string | null;
  occupationId: number | null;
  city: string | null;
  state: string | null;
  subscribedAt: string;
  lastEmailSentAt: string | null;
  isActive: boolean;
  userCreatedAt: string;
}

export interface NewsletterSubscribersResponse {
  subscribers: NewsletterSubscriber[];
  total: number;
  page: number;
  limit: number;
}

export interface NewsletterSubscriberFilters {
  page?: number;
  limit?: number;
  search?: string;
  occupationId?: number;
  city?: string;
  state?: string;
  status?: "active" | "unsubscribed";
}

export interface NewsletterOverview {
  isEnabled: boolean;
  subscriberCount: number;
  lastRun: {
    sentAt: string;
    sent: number;
    skipped: number;
    failed: number;
  } | null;
}

export interface NewsletterSendLog {
  id: string;
  email: string;
  status: "SUCCESS" | "SKIPPED" | "FAILED";
  error: string | null;
  sentAt: string;
}

export interface NewsletterSendLogsResponse {
  logs: NewsletterSendLog[];
  total: number;
  page: number;
  limit: number;
}
