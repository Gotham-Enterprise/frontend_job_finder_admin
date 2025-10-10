import { NextRequest, NextResponse } from "next/server";
import { newsletterStore } from "./newsletterStore";

interface NewsletterPayload {
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
  design?: any; // Unlayer design JSON
}

// POST /api/admin/newsletter - Create new newsletter
export async function POST(request: NextRequest) {
  try {
    const body: NewsletterPayload = await request.json();

    console.log("🔍 [BACKEND] Received body.design:", body.design);
    console.log("🔍 [BACKEND] design type:", typeof body.design);
    console.log("🔍 [BACKEND] design keys:", body.design ? Object.keys(body.design) : []);
    console.log("🔍 [BACKEND] design JSON:", JSON.stringify(body.design).substring(0, 200));

    if (!body.content || body.content.trim().length === 0) {
      console.warn("⚠️ Validation failed: Content is required");
      return NextResponse.json(
        {
          success: false,
          message: "Content is required",
          error: "Content is required",
          field: "content",
        },
        { status: 400 }
      );
    }

    if (!body.subject || body.subject.trim().length === 0) {
      console.warn("⚠️ Validation failed: Subject is required");
      return NextResponse.json(
        {
          success: false,
          message: "Subject is required",
          error: "Subject is required",
          field: "subject",
        },
        { status: 400 }
      );
    }

    const newsletterId = `newsletter_${Date.now()}`;

    const mockNewsletter = {
      id: newsletterId,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in memory with proper JSON design object
    newsletterStore.create(mockNewsletter);

    console.log("✅ [BACKEND] Newsletter created and stored:", newsletterId);

    return NextResponse.json(
      {
        success: true,
        message: "Newsletter created successfully",
        data: mockNewsletter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating newsletter:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create newsletter",
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/newsletter - Get all newsletters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    console.log("📋 Fetching newsletters, status filter:", status);

    // Get newsletters from store
    const newsletters = newsletterStore.getAll(status as "DRAFT" | "SCHEDULED" | "SENT" | "ARCHIVED" | undefined);

    console.log("✅ [BACKEND] Retrieved newsletters:", newsletters.length);

    return NextResponse.json(
      {
        success: true,
        data: newsletters,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching newsletters:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch newsletters",
      },
      { status: 500 }
    );
  }
}
