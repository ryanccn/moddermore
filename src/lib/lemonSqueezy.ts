import type { NextApiRequest } from 'next';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { buffer } from 'node:stream/consumers';

export const validateLSRequest = async (req: NextApiRequest, buf: Buffer) => {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const hmac = createHmac('sha256', secret);

  const digest = Buffer.from(hmac.update(buf).digest('hex'), 'utf8');
  const signature = Buffer.from(
    typeof req.headers['x-signature'] === 'string'
      ? req.headers['x-signature']
      : '',
    'utf8'
  );

  try {
    return timingSafeEqual(digest, signature);
  } catch (error) {
    console.error(error);
    return false;
  }
};

interface LemonSqueezySubscription {
  type: 'subscriptions';
  id: string;
  attributes: {
    store_id: number;
    order_id: number;
    order_item_id: number;
    product_id: number;
    variant_id: number;
    product_name: string;
    variant_name: string;
    user_name: string;
    user_email: string;
    status: string;
    status_formatted: string;
    pause: unknown;
    cancelled: boolean;
    trial_ends_at: string;
    billing_anchor: number;
    urls: Record<string, string>;
    renews_at: string;
    ends_at: string;
    created_at: string;
    updated_at: string;
    test_mode: boolean;
  };
}

interface LemonSqueezySubscriptionCreatedEvent {
  event: 'subscription_created';
  data: LemonSqueezySubscription;
}

interface LemonSqueezySubscriptionExpiredEvent {
  event: 'subscription_expired';
  data: LemonSqueezySubscription;
}

type LemonSqueezyEvent =
  | LemonSqueezySubscriptionCreatedEvent
  | LemonSqueezySubscriptionExpiredEvent;

export const parseLSRequest = async (
  req: NextApiRequest
): Promise<LemonSqueezyEvent | null> => {
  const dataBuf = await buffer(req);

  const valid = await validateLSRequest(req, dataBuf);
  if (!valid) return null;

  const textBody = dataBuf.toString();
  const { data } = JSON.parse(textBody);
  const event = req.headers['x-event-name'];

  if (typeof event !== 'string') return null;

  if (event === 'subscription_created')
    return { event, data: data as LemonSqueezySubscription };
  else if (event === 'subscription_expired')
    return { event, data: data as LemonSqueezySubscription };
  else return null;
};
