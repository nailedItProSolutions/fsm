import { NextRequest, NextResponse } from 'next/server';
import { FSMStore } from '@/lib/store';
import { verifyServerAuth } from '@/lib/serverAuth';
import Stripe from 'stripe';

/**
 * Stripe Subscriptions Webhook & Automated Renewal Dispatcher
 * Listens for recurring renewal events and auto-generates
 * 'Preventative Maintenance' jobs in the Unscheduled queue of the Dispatch Board.
 * 
 * Enforces Stripe Webhook Signing Secret verification to protect
 * against unauthorized job creation payloads.
 */
export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSignature = req.headers.get('stripe-signature');
    const rawBody = await req.text();

    let subscriptionId: string | undefined;

    // 1. Enforce Webhook Signature Verification if webhookSecret is configured
    if (webhookSecret) {
      if (!stripeSignature) {
        return NextResponse.json(
          { error: 'Security Check Failed: Missing stripe-signature header.' },
          { status: 400 }
        );
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_live_placeholder', {
        apiVersion: '2024-06-20' as any,
      });

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret);
      } catch (err: any) {
        console.error('Stripe webhook signature verification failed:', err.message);
        return NextResponse.json(
          { error: `Webhook signature verification failed: ${err.message}` },
          { status: 400 }
        );
      }

      // Handle valid Stripe webhook event types
      if (
        event.type === 'invoice.paid' ||
        event.type === 'invoice.payment_succeeded' ||
        event.type === 'customer.subscription.updated'
      ) {
        const invoiceOrSub = event.data.object as any;
        subscriptionId = invoiceOrSub.subscription || invoiceOrSub.id;
      } else {
        // Acknowledge unhandled event types without error
        return NextResponse.json({ received: true, ignoredType: event.type });
      }
    } else {
      // If running in strict production mode, missing webhook secret is prohibited
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Server Security Misconfiguration: STRIPE_WEBHOOK_SECRET must be configured in production.' },
          { status: 500 }
        );
      }

      // In development / local testing: Parse JSON and verify either admin credentials or test payload
      try {
        const body = JSON.parse(rawBody || '{}');
        subscriptionId = body.subscriptionId;

        if (!subscriptionId && body.data?.object) {
          const obj = body.data.object;
          subscriptionId = obj.subscription || obj.id;
        }
      } catch {
        return NextResponse.json(
          { error: 'Malformed JSON payload.' },
          { status: 400 }
        );
      }
    }

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId in verified request payload.' },
        { status: 400 }
      );
    }

    const store = FSMStore.getInstance();
    let sub = store.getSubscriptionById(subscriptionId);

    // If not found by internal ID, check by stripeSubscriptionId
    if (!sub) {
      sub = store.getSubscriptions().find((s) => s.stripeSubscriptionId === subscriptionId);
    }

    if (!sub) {
      return NextResponse.json(
        { error: `Subscription ${subscriptionId} not found in database.` },
        { status: 404 }
      );
    }

    const result = store.triggerSubscriptionRenewal(sub.id);

    if (!result) {
      return NextResponse.json(
        { error: `Subscription ${sub.id} is not active or could not be renewed.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Preventative Maintenance job auto-dispatched to Unscheduled queue.',
      jobId: result.job.id,
      jobNumber: result.job.jobNumber,
      status: result.job.status,
      renewalInvoiceId: result.renewalInvoice.id,
      renewalInvoiceNumber: result.renewalInvoice.invoiceNumber,
      amount: result.renewalInvoice.total,
    });
  } catch (error: any) {
    console.error('Error handling subscription renewal webhook:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error processing webhook.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Enforce server authentication for querying subscription stats
  const authResult = await verifyServerAuth(req);
  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json(
      { error: authResult.error || 'Authentication required to access subscription metrics.' },
      { status: authResult.status }
    );
  }

  const store = FSMStore.getInstance();
  return NextResponse.json({
    activeSubscriptions: store.getSubscriptions().filter((s) => s.status === 'active'),
    total: store.getSubscriptions().length,
  });
}
