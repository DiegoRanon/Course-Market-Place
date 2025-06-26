import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function POST(request) {
  try {
    const { token, confirmationCode } = await request.json();

    // Handle token-based confirmation (from email link)
    if (token) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      // If email confirmation is successful, create the user profile
      if (data.user) {
        try {
          // Get user metadata to determine role
          const userMetadata = data.user.user_metadata || {};
          const role = userMetadata.role || "student";
          
          // Create profile record
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            first_name: userMetadata.first_name || "",
            last_name: userMetadata.last_name || "",
            full_name: userMetadata.full_name || "",
            role: role,
            status: "active",
          });

          if (profileError) {
            console.error("Error creating profile:", profileError);
            // Don't fail the email confirmation if profile creation fails
            // The profile can be created later
          } else {
            console.log("Profile created successfully for user:", data.user.id, "with role:", role);
          }
        } catch (profileError) {
          console.error("Error creating profile:", profileError);
          // Don't fail the email confirmation if profile creation fails
        }
      }

      return NextResponse.json({ success: true });
    }

    // Handle confirmation code (manual entry)
    if (confirmationCode) {
      // For testing purposes, we'll accept any 6-digit code
      // In production, you would verify against a stored code in your database
      if (!/^\d{6}$/.test(confirmationCode)) {
        return NextResponse.json(
          { success: false, error: "Invalid confirmation code format" },
          { status: 400 }
        );
      }

      // For now, we'll simulate a successful confirmation
      // In a real implementation, you would:
      // 1. Look up the user by email or session
      // 2. Verify the confirmation code matches what was sent
      // 3. Update the user's email_confirmed_at field
      // 4. Optionally sign the user in

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "No token or confirmation code provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Email confirmation error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
