import { NextRequest, NextResponse } from "next/server";

interface NewsletterPayload {
  subject?: string;
  fromName?: string;
  fromAddress?: string;
  sendTo?: string[];
  dontSendTo?: string[];
  status?: "DRAFT" | "SCHEDULED" | "SENT";
  scheduledAt?: string;
  scheduledTimezone?: string;
  isTemplate?: boolean;
  content?: string;
  design?: any; // Unlayer design JSON
}

// GET /api/admin/newsletter/[id] - Get single newsletter
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    console.log("📋 Fetching newsletter:", id);

    // TODO: Replace with actual database call
    const mockNewsletter = {
      id: id,
      subject: "Sample Newsletter",
      status: "DRAFT",
      content: "<p>Newsletter content</p>",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: mockNewsletter,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching newsletter:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch newsletter",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/newsletter/[id] - Update newsletter
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body: NewsletterPayload = await request.json();

    console.log("📝 Updating newsletter:", id, {
      subject: body.subject,
      status: body.status,
      contentLength: body.content?.length || 0,
      hasDesign: !!body.design,
    });

    // TODO: Replace with actual database call
    const mockUpdatedNewsletter = {
      id: id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    console.log("Newsletter updated successfully:", id);

    return NextResponse.json(
      {
        success: true,
        message: "Newsletter updated successfully",
        data: mockUpdatedNewsletter,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating newsletter:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update newsletter",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/newsletter/[id] - Delete newsletter
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    console.log("🗑️ Deleting newsletter:", id);

    // TODO: Replace with actual database call

    console.log("✅ Newsletter deleted successfully:", id);

    return NextResponse.json(
      {
        success: true,
        message: "Newsletter deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting newsletter:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete newsletter",
      },
      { status: 500 }
    );
  }
}
