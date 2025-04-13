import { createClient } from '@supabase/supabase-js'

    // Hardcode Supabase URL and Anon Key for GitHub Pages deployment
    const supabaseUrl = "https://rwsjbkedgztplwzxoxks.supabase.co"
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c2pia2VkZ3p0cGx3enhveGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Njg1MzAsImV4cCI6MjA1OTI0NDUzMH0.cfd5F50Yu3Kmu-ipJzPjHWeLe6bcmk4MzXCw91PI_Jg"

    // No need for the check anymore as values are hardcoded
    // if (!supabaseUrl || !supabaseAnonKey) {
    //   throw new Error("Supabase URL or Anon Key is missing.");
    // }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey)
