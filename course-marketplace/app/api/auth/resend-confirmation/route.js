import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Resend confirmation email
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/auth/confirm`,
      },
    });

    if (error) {
      // Check if it's a "User not found" error
      if (error.message.includes("User not found")) {
        return NextResponse.json(
          { success: false, error: "Email not found" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Confirmation email sent successfully",
    });
  } catch (error) {
    console.error("Resend confirmation error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
