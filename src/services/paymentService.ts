import { supabase } from '../lib/supabaseClient';

export interface CreateOrderRequest {
  plan_id: 'starter' | 'professional';
  billing_cycle: 'monthly' | 'yearly';
  amount: number; // in paise
}

export interface CreateOrderResponse {
  order_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  plan_id: 'starter' | 'professional';
  billing_cycle: 'monthly' | 'yearly';
  amount: number; // in paise, needed for subscription activation
}

export interface VerifyPaymentResponse {
  success: boolean;
  subscription_id?: string;
  message: string;
}

class PaymentService {
  private getEdgeFunctionUrl(functionName: string): string {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL is not set in environment variables');
    }
    return `${supabaseUrl}/functions/v1/${functionName}`;
  }

  async createPaymentOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Edge function expects action as query parameter, not in body
      const url = new URL(this.getEdgeFunctionUrl('razorpay-payments'));
      url.searchParams.set('action', 'create-order');

      // Request body should only contain: amount, currency (optional), receipt (optional)
      // Note: The edge function expects amount in rupees and multiplies by 100 internally
      // So we convert paise to rupees here
      const requestBody = {
        amount: request.amount / 100, // Convert paise to rupees (edge function will multiply by 100)
        currency: 'INR',
        receipt: `plan_${request.plan_id}_${request.billing_cycle}_${Date.now()}`,
      };

      // Log request for debugging
      console.log('Creating payment order with:', {
        url: url.toString(),
        body: requestBody,
        plan_id: request.plan_id,
        billing_cycle: request.billing_cycle,
      });

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment order error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Failed to create order: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Payment order created successfully:', data);
      
      // Return in expected format
      return {
        order_id: data.order?.id || data.order_id,
        razorpay_order_id: data.order?.id || data.order_id,
        amount: data.order?.amount || request.amount, // Keep in paise
        currency: data.order?.currency || 'INR',
        key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
      };
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Edge function expects action as query parameter
      const url = new URL(this.getEdgeFunctionUrl('razorpay-payments'));
      url.searchParams.set('action', 'verify-payment');

      // Edge function expects: payment_id, order_id, signature (not razorpay_ prefix)
      const requestBody = {
        payment_id: request.razorpay_payment_id,
        order_id: request.razorpay_order_id,
        signature: request.razorpay_signature,
      };

      // Log request for debugging
      console.log('Verifying payment with:', {
        url: url.toString(),
        payment_id: requestBody.payment_id,
        order_id: requestBody.order_id,
        signature: requestBody.signature.substring(0, 20) + '...', // Partial log for security
        plan_id: request.plan_id,
        billing_cycle: request.billing_cycle,
      });

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment verification error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Failed to verify payment: ${response.status} - ${errorText}`);
      }

      const verifyData = await response.json();
      console.log('Payment verified successfully:', verifyData);

      if (!verifyData.verified) {
        throw new Error('Payment signature verification failed');
      }

      // After verification, activate subscription
      // Edge function expects: user_id, plan_id, payment_id, order_id, amount, billing_cycle
      const activateUrl = new URL(this.getEdgeFunctionUrl('razorpay-payments'));
      activateUrl.searchParams.set('action', 'activate-subscription');

      // Amount should be in paise (as stored in Razorpay order)
      // The edge function will handle it correctly
      const activateBody = {
        user_id: session.user.id,
        plan_id: request.plan_id,
        payment_id: request.razorpay_payment_id,
        order_id: request.razorpay_order_id,
        amount: request.amount, // Amount in paise
        billing_cycle: request.billing_cycle,
      };

      console.log('Activating subscription with:', {
        url: activateUrl.toString(),
        body: activateBody,
      });

      const activateResponse = await fetch(activateUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(activateBody),
      });

      if (!activateResponse.ok) {
        const errorText = await activateResponse.text();
        console.error('Subscription activation error:', errorText);
        throw new Error(`Payment verified but subscription activation failed: ${errorText}`);
      }

      const activateData = await activateResponse.json();
      console.log('Subscription activated successfully:', activateData);

      return {
        success: true,
        subscription_id: activateData.subscription?.id || activateData.subscription_id,
        message: 'Payment verified and subscription activated successfully',
      };
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      throw new Error(error.message || 'Failed to verify payment');
    }
  }
}

export const paymentService = new PaymentService();

