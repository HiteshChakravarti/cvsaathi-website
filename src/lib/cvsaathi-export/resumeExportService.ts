// Minimal web-only export service that calls a Supabase Edge Function to render HTML → PDF.
// Uses Vite env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

import { supabase } from "../supabaseClient";

interface EdgeExportResponse {
  url?: string;
  signedUrl?: string;
  signed_url?: string;
}

class ResumeExportService {
  async exportPdf(html: string, fileName: string): Promise<string | null> {
    if (typeof window === "undefined") return null;

    // Allow disabling edge export via env for local/dev
    const edgeToggle = (import.meta.env.VITE_RESUME_EXPORT_VIA_EDGE ?? "true").toString().toLowerCase();
    if (edgeToggle === "false") {
      return null;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!supabaseUrl || !supabaseAnon) {
      console.error("Supabase configuration missing for resume export");
      return null;
    }

    try {
      // Prefer user JWT if available (some functions require user context)
      let bearer = supabaseAnon;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          bearer = session.access_token;
        }
      } catch { /* ignore */ }

      const response = await fetch(`${supabaseUrl}/functions/v1/resume-export`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearer}`,
          "Content-Type": "application/json",
          apikey: supabaseAnon,
        },
        body: JSON.stringify({ html, fileName }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Resume export edge function error:", errorText);
        return null;
      }

      const data = (await response.json()) as EdgeExportResponse;
      return data.url || data.signedUrl || data.signed_url || null;
    } catch (err) {
      console.error("Resume export edge function failed:", err);
      return null;
    }
  }
}

export default new ResumeExportService();


