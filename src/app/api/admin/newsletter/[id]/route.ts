import { NextRequest, NextResponse } from "next/server";
import { newsletterStore } from "../newsletterStore";

interface NewsletterPayload {
  subject?: string;
  fromName?: string;
  fromAddress?: string;
  sendTo?: string[];
  dontSendTo?: string[];
  status?: "DRAFT" | "SCHEDULED" | "SENT" | "ARCHIVED";
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

    // Get newsletter from store
    const newsletter = newsletterStore.get(id);

    if (!newsletter) {
      return NextResponse.json(
        {
          success: false,
          message: "Newsletter not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newsletter,
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

    console.log("� [BACKEND UPDATE] Received body.design:", body.design);
    console.log("🔍 [BACKEND UPDATE] design type:", typeof body.design);
    console.log("🔍 [BACKEND UPDATE] design keys:", body.design ? Object.keys(body.design) : []);
    console.log(
      "🔍 [BACKEND UPDATE] design JSON preview:",
      body.design ? JSON.stringify(body.design).substring(0, 200) : "null"
    );

    console.log("�📝 Updating newsletter:", id, {
      subject: body.subject,
      status: body.status,
      contentLength: body.content?.length || 0,
      hasDesign: !!body.design,
    });

    // Update newsletter in store
    const updatedNewsletter = newsletterStore.update(id, body);

    if (!updatedNewsletter) {
      return NextResponse.json(
        {
          success: false,
          message: "Newsletter not found",
        },
        { status: 404 }
      );
    }

    console.log("✅ [BACKEND] Newsletter updated successfully:", id);
    console.log("✅ [BACKEND] Updated design type:", typeof updatedNewsletter.design);

    return NextResponse.json(
      {
        success: true,
        message: "Newsletter updated successfully",
        data: updatedNewsletter,
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

    // Delete from store
    const deleted = newsletterStore.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Newsletter not found",
        },
        { status: 404 }
      );
    }

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
