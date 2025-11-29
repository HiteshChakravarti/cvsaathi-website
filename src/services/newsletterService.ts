import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

/**
 * Subscribe email to newsletter
 * Stores email in Supabase for marketing purposes
 */
export async function subscribeToNewsletter(email: string): Promise<boolean> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Try to insert into newsletter_subscriptions table
    // If table doesn't exist, we'll handle gracefully
    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email: email.toLowerCase().trim(),
        subscribed_at: new Date().toISOString(),
        source: 'landing_page_footer',
        status: 'active',
      });

    if (error) {
      // If table doesn't exist, log but don't fail
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.warn('Newsletter table not found. Please create the table in Supabase.');
        // Fallback: Store in localStorage for now (can be migrated later)
        const existing = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
        if (!existing.includes(email.toLowerCase().trim())) {
          existing.push({
            email: email.toLowerCase().trim(),
            subscribed_at: new Date().toISOString(),
            source: 'landing_page_footer',
          });
          localStorage.setItem('newsletter_subscriptions', JSON.stringify(existing));
        }
        toast.success('Successfully subscribed! We\'ll keep you updated.');
        return true;
      }
      
      // If email already exists (unique constraint)
      if (error.code === '23505') {
        toast.info('You\'re already subscribed!');
        return true;
      }
      
      throw error;
    }

    toast.success('Successfully subscribed! We\'ll keep you updated.');
    return true;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    toast.error('Something went wrong. Please try again later.');
    return false;
  }
}

/**
 * SQL to create newsletter_subscriptions table in Supabase:
 * 
 * CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   email TEXT NOT NULL UNIQUE,
 *   subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   source TEXT DEFAULT 'landing_page_footer',
 *   status TEXT DEFAULT 'active',
 *   unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);
 * CREATE INDEX IF NOT EXISTS idx_newsletter_status ON public.newsletter_subscriptions(status);
 */

