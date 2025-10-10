import { NextRequest, NextResponse } from "next/server";

interface NewsletterPayload {
  subject: string;
  fromName: string;
  fromAddress: string;
  sendTo: string[];
  dontSendTo: string[];
  status: "DRAFT" | "SCHEDULED" | "SENT";
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

    const mockNewsletter = {
      id: `newsletter_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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

    // TODO: Replace with actual database call
    const mockNewsletters = [
      {
        id: "newsletter_1",
        subject: "Welcome Newsletter",
        status: "DRAFT",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: mockNewsletters,
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
