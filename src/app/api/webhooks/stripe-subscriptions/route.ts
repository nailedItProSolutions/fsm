import { NextRequest, NextResponse } from 'next/server';
import { FSMStore } from '@/lib/store';

/**
 * Stripe Subscriptions Webhook & Automated Renewal Dispatcher
 * Listens for recurring renewal events and auto-generates
 * 'Preventative Maintenance' jobs in the Unscheduled queue of the Dispatch Board.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both direct renewal trigger and standard Stripe webhook payloads
    let subscriptionId: string | undefined = body.subscriptionId;

    if (!subscriptionId && body.data?.object) {
      const obj = body.data.object;
      // Stripe invoice.paid or customer.subscription.updated
      subscriptionId = obj.subscription || obj.id;
    }

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId in request payload' },
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
        { error: `Subscription ${subscriptionId} not found` },
        { status: 404 }
      );
    }

    const result = store.triggerSubscriptionRenewal(sub.id);

    if (!result) {
      return NextResponse.json(
        { error: `Subscription is not active or could not be renewed` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Preventative Maintenance job auto-dispatched to Unscheduled queue',
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
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const store = FSMStore.getInstance();
  return NextResponse.json({
    activeSubscriptions: store.getSubscriptions().filter((s) => s.status === 'active'),
    total: store.getSubscriptions().length,
  });
}
