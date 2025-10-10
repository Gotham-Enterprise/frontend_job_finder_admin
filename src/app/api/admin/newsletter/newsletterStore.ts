// In-memory store for newsletters (temporary until database is connected)
// This will persist data during the session

interface Newsletter {
  id: string;
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
  design?: any; // This will store the actual JSON object
  createdAt: string;
  updatedAt: string;
}

class NewsletterStore {
  private newsletters: Map<string, Newsletter> = new Map();

  create(newsletter: Newsletter): Newsletter {
    console.log("📝 [STORE] Creating newsletter:", newsletter.id);
    console.log("📝 [STORE] Design type:", typeof newsletter.design);
    console.log("📝 [STORE] Design keys:", newsletter.design ? Object.keys(newsletter.design) : []);

    this.newsletters.set(newsletter.id, newsletter);
    return newsletter;
  }

  update(id: string, updates: Partial<Newsletter>): Newsletter | null {
    const existing = this.newsletters.get(id);
    if (!existing) {
      console.warn("⚠️ [STORE] Newsletter not found:", id);
      return null;
    }

    console.log("📝 [STORE] Updating newsletter:", id);
    console.log("📝 [STORE] Updates design type:", typeof updates.design);
    console.log("📝 [STORE] Updates design keys:", updates.design ? Object.keys(updates.design) : []);

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.newsletters.set(id, updated);

    console.log("✅ [STORE] Newsletter updated:", id);
    console.log("✅ [STORE] Stored design type:", typeof updated.design);

    return updated;
  }

  get(id: string): Newsletter | null {
    const newsletter = this.newsletters.get(id);

    if (newsletter) {
      console.log("📖 [STORE] Retrieved newsletter:", id);
      console.log("📖 [STORE] Design type:", typeof newsletter.design);
      console.log("📖 [STORE] Design keys:", newsletter.design ? Object.keys(newsletter.design) : []);
    }

    return newsletter || null;
  }

  getAll(statusFilter?: "DRAFT" | "SCHEDULED" | "SENT" | "ARCHIVED"): Newsletter[] {
    const all = Array.from(this.newsletters.values());

    if (statusFilter) {
      return all.filter((n) => n.status === statusFilter);
    }

    return all;
  }

  delete(id: string): boolean {
    return this.newsletters.delete(id);
  }
}

// Export a singleton instance
export const newsletterStore = new NewsletterStore();
