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
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

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
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: NewsletterPayload = await request.json();

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
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

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
