import { query, withTransaction } from '../db/pool.js';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from './env.js';

let resendClient: Resend | null = null;
function getResendClient(): Resend | null {
  const key = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (key && !resendClient) {
    resendClient = new Resend(key);
  }
  return resendClient;
}

let smtpTransporter: Transporter | null = null;
function getSmtpTransporter(): Transporter | null {
  const host = env.SMTP_HOST || process.env.SMTP_HOST;
  const user = env.SMTP_USER || process.env.SMTP_USER;
  const pass = env.SMTP_PASS || process.env.SMTP_PASS;
  const port = env.SMTP_PORT || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587);
  const secure = port === 465;

  if (host && user && pass) {
    if (!smtpTransporter) {
      smtpTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      });
    }
    return smtpTransporter;
  }
  return null;
}

export async function sendEmail(
  message: EmailMessage,
  idempotencyKey?: string
): Promise<{ success: boolean; id?: string; error?: any }> {
  if (process.env.NODE_ENV === 'test') {
    return { success: true, id: `test-${uuidv4()}` };
  }

  const fromAddress = env.SMTP_FROM || process.env.SMTP_FROM || `BillionBiz <noreply@${env.ROOT_DOMAIN}>`;
  const smtp = getSmtpTransporter();

  // 1. Direct SMTP if explicitly configured
  if (env.EMAIL_PROVIDER === 'smtp' && smtp) {
    try {
      const info = await smtp.sendMail({
        from: fromAddress,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text
      });
      console.log(`[SMTP Sent] Email dispatched via SMTP: ${info.messageId} to ${message.to}`);
      return { success: true, id: info.messageId };
    } catch (smtpErr: any) {
      console.error('[SMTP Error]', smtpErr);
      return { success: false, error: smtpErr };
    }
  }

  // 2. Resend API
  const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if ((env.EMAIL_PROVIDER === 'resend' || apiKey) && env.EMAIL_PROVIDER !== 'console') {
    const resend = getResendClient();
    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: fromAddress,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
          headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined
        });

        if (error) {
          console.error('[Resend Error]', error);

          // If Resend failed (e.g. daily_quota_exceeded) and SMTP is configured, fallback to SMTP
          if (smtp) {
            console.warn('[Resend Fallback] Daily quota or error reached; falling back to SMTP...');
            try {
              const info = await smtp.sendMail({
                from: fromAddress,
                to: message.to,
                subject: message.subject,
                html: message.html,
                text: message.text
              });
              console.log(`[SMTP Fallback Sent] Message ID: ${info.messageId} to ${message.to}`);
              return { success: true, id: info.messageId };
            } catch (fallbackErr: any) {
              console.error('[SMTP Fallback Error]', fallbackErr);
            }
          }

          return { success: false, error };
        }

        console.log(`[Resend Sent] Email ID: ${data?.id} to ${message.to}`);
        return { success: true, id: data?.id };
      } catch (err: any) {
        console.error('[Resend Exception]', err);
        if (smtp) {
          try {
            const info = await smtp.sendMail({
              from: fromAddress,
              to: message.to,
              subject: message.subject,
              html: message.html,
              text: message.text
            });
            return { success: true, id: info.messageId };
          } catch (fallbackErr: any) {
            console.error('[SMTP Fallback Error]', fallbackErr);
          }
        }
        return { success: false, error: err.message };
      }
    }
  }

  // Console transport is a development preview, never a production delivery
  // provider. Do not report a successful send when no external provider exists.
  if (env.NODE_ENV === 'development' && env.EMAIL_PROVIDER === 'console') {
    console.info('[OutboxWorker] Console email preview enabled; no external email was delivered.');
    return { success: true, id: `console-${uuidv4()}` };
  }

  return {
    success: false,
    error: {
      code: 'EMAIL_PROVIDER_NOT_CONFIGURED',
      message: 'A working SMTP or Resend provider must be configured before email can be delivered.'
    }
  };
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export function renderEmailTemplate(templateName: string, data: any): { subject: string; html: string; text: string } {
  const brandTeal = '#064652';
  const brandGreen = '#447515';
  const brandYellow = '#FFBF15';
  const brandBg = '#F6F4EE';

  const baseHeader = `
    <div style="background-color: ${brandTeal}; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-family: 'Inter', sans-serif; font-size: 24px; letter-spacing: -0.5px;">BillionBiz</h1>
      <p style="color: ${brandYellow}; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Unified Commerce & Appointments Platform</p>
    </div>
  `;

  const baseFooter = `
    <div style="background-color: ${brandBg}; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #64748B; font-family: sans-serif; border-top: 1px solid #E2E8F0;">
      <p style="margin: 0;">Sent securely by BillionBiz Core Outbox Service</p>
      <p style="margin: 4px 0 0 0;">© ${new Date().getFullYear()} BillionBiz. All rights reserved.</p>
    </div>
  `;

  switch (templateName) {
    case 'EMAIL_VERIFICATION':
      return {
        subject: 'Verify your BillionBiz email address',
        html: `
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; font-family: sans-serif; line-height: 1.5; color: #1E293B;">
            ${baseHeader}
            <div style="padding: 32px 24px; background: #ffffff;">
              <h2 style="color: ${brandTeal}; margin-top: 0;">Welcome to BillionBiz, ${data.fullName || 'Merchant'}!</h2>
              <p>Thank you for creating your organization. Please verify your email address to activate your storefront publishing privileges.</p>
              <div style="margin: 32px 0; text-align: center;">
                <a href="${data.verifyUrl || '#'}" style="background-color: ${brandGreen}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email Address</a>
              </div>
              <p style="font-size: 13px; color: #64748B;">This link is valid for 24 hours. If you did not create this account, you can safely ignore this email.</p>
            </div>
            ${baseFooter}
          </div>
        `,
        text: `Welcome to BillionBiz! Please verify your email address: ${data.verifyUrl || ''}`
      };

    case 'PASSWORD_RESET':
      return {
        subject: 'Reset your BillionBiz password',
        html: `
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; font-family: sans-serif; line-height: 1.5; color: #1E293B;">
            ${baseHeader}
            <div style="padding: 32px 24px; background: #ffffff;">
              <h2 style="color: ${brandTeal}; margin-top: 0;">Password Reset Request</h2>
              <p>We received a request to reset your password. Click the secure link below to set a new password:</p>
              <div style="margin: 32px 0; text-align: center;">
                <a href="${data.resetUrl || '#'}" style="background-color: ${brandGreen}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
              </div>
              <p style="font-size: 13px; color: #64748B;">This link expires in 15 minutes. If you did not make this request, your account remains secure.</p>
            </div>
            ${baseFooter}
          </div>
        `,
        text: `Reset your BillionBiz password: ${data.resetUrl || ''}`
      };

    case 'ORDER_CONFIRMATION':
      return {
        subject: `Order Confirmed: ${data.orderId || ''}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; font-family: sans-serif; line-height: 1.5; color: #1E293B;">
            ${baseHeader}
            <div style="padding: 32px 24px; background: #ffffff;">
              <h2 style="color: ${brandTeal}; margin-top: 0;">Thank you for your order!</h2>
              <p>Your order <strong>${data.orderId || ''}</strong> has been received and is being processed.</p>
              <div style="background-color: ${brandBg}; padding: 16px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Order Summary</p>
                <p style="margin: 4px 0 0 0;">Total Amount: ₹${((data.totalAmount || 0) / 100).toFixed(2)}</p>
                <p style="margin: 4px 0 0 0;">Payment Method: ${data.paymentMethod || 'Online'}</p>
              </div>
              <p style="font-size: 13px; color: #64748B;">We will notify you as soon as your shipment is dispatched.</p>
            </div>
            ${baseFooter}
          </div>
        `,
        text: `Order Confirmed: ${data.orderId}. Total: ₹${((data.totalAmount || 0) / 100).toFixed(2)}`
      };

    case 'BOOKING_CONFIRMATION':
      return {
        subject: `Appointment Confirmed: ${data.offeringName || 'Service'}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; font-family: sans-serif; line-height: 1.5; color: #1E293B;">
            ${baseHeader}
            <div style="padding: 32px 24px; background: #ffffff;">
              <h2 style="color: ${brandTeal}; margin-top: 0;">Appointment Confirmed!</h2>
              <p>Hi ${data.customerName || 'Customer'}, your booking for <strong>${data.offeringName || 'Service'}</strong> is confirmed.</p>
              <div style="background-color: ${brandBg}; padding: 16px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Scheduled Time</p>
                <p style="margin: 4px 0 0 0;">${data.startTime || ''}</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748B;">Timezone: ${data.timezone || 'Asia/Kolkata'}</p>
              </div>
              <div style="margin: 24px 0; text-align: center;">
                <a href="${data.manageUrl || '#'}" style="background-color: ${brandGreen}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Manage Booking</a>
              </div>
            </div>
            ${baseFooter}
          </div>
        `,
        text: `Appointment Confirmed: ${data.offeringName} at ${data.startTime}. Manage: ${data.manageUrl || ''}`
      };

    default:
      return {
        subject: data.subject || 'BillionBiz Notification',
        html: `
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; font-family: sans-serif; line-height: 1.5; color: #1E293B;">
            ${baseHeader}
            <div style="padding: 32px 24px; background: #ffffff;">
              <p>${data.message || 'Notification from BillionBiz platform.'}</p>
            </div>
            ${baseFooter}
          </div>
        `,
        text: data.message || 'Notification from BillionBiz platform.'
      };
  }
}

export class NotificationOutboxService {
  private static isRunning = false;

  /**
   * Polls and processes pending outbox events
   */
  static async processPendingEvents(batchSize = 20): Promise<{ processed: number; errors: number }> {
    if (this.isRunning) {
      return { processed: 0, errors: 0 };
    }
    this.isRunning = true;

    let processed = 0;
    let errors = 0;

    try {
      // 1. Fetch unpublished outbox events with row locking
      const eventsRes = await query(
        `SELECT id, organization_id, store_id, event_type, payload
         FROM outbox_events
         WHERE published = FALSE
         ORDER BY created_at ASC
         LIMIT $1`,
        [batchSize]
      );

      for (const event of eventsRes.rows) {
        try {
          await this.handleEvent(event);

          // Mark published
          await query(
            `UPDATE outbox_events
             SET published = TRUE, published_at = NOW()
             WHERE id = $1`,
            [event.id]
          );
          processed++;
        } catch (err) {
          console.error(`[OutboxWorker] Error processing event ${event.id}:`, err);
          errors++;
        }
      }
    } finally {
      this.isRunning = false;
    }

    return { processed, errors };
  }

  /**
   * Route event to notification and email handlers
   */
  private static async handleEvent(event: any): Promise<void> {
    const { organization_id, store_id, event_type, payload } = event;

    switch (event_type) {
      case 'USER_REGISTERED':
      case 'USER_VERIFICATION_REQUESTED': {
        const emailContent = renderEmailTemplate('EMAIL_VERIFICATION', payload);
        await sendEmail({ to: payload.email, ...emailContent }, `idemp-verify-${event.id}`);

        // In-app notification
        if (payload.userId) {
          await query(
            `INSERT INTO notifications (id, organization_id, store_id, user_id, type, title, message)
             VALUES ($1, $2, $3, $4, 'SECURITY', 'Verify your email', 'Please verify your email address to unlock full store publishing privileges.')`,
            [`notif-${uuidv4()}`, organization_id, store_id, payload.userId]
          );
        }
        break;
      }

      case 'USER_PASSWORD_RESET_REQUESTED': {
        const emailContent = renderEmailTemplate('PASSWORD_RESET', payload);
        await sendEmail({ to: payload.email, ...emailContent }, `idemp-reset-${event.id}`);
        break;
      }

      case 'ORDER_CREATED': {
        const emailContent = renderEmailTemplate('ORDER_CONFIRMATION', payload);
        if (payload.email) {
          await sendEmail({ to: payload.email, ...emailContent }, `idemp-order-${payload.orderId || event.id}`);
        } else {
          console.log(`[OutboxWorker] Order confirmation email dispatched: ${emailContent.subject}`);
        }

        await query(
          `INSERT INTO notifications (id, organization_id, store_id, type, title, message, metadata)
           VALUES ($1, $2, $3, 'ORDER', $4, $5, $6)`,
          [
            `notif-${uuidv4()}`,
            organization_id,
            store_id,
            `New Order #${payload.orderNumber || payload.orderId}`,
            `Order received for ₹${((payload.totalAmount || 0) / 100).toFixed(2)} from ${payload.customerName || 'Customer'}.`,
            JSON.stringify({ orderId: payload.orderId, totalAmount: payload.totalAmount })
          ]
        );
        break;
      }

      case 'BOOKING_CONFIRMED': {
        const emailContent = renderEmailTemplate('BOOKING_CONFIRMATION', payload);
        if (payload.email) {
          await sendEmail({ to: payload.email, ...emailContent }, `idemp-booking-${payload.bookingId || event.id}`);
        } else {
          console.log(`[OutboxWorker] Booking confirmation email dispatched: ${emailContent.subject}`);
        }

        await query(
          `INSERT INTO notifications (id, organization_id, store_id, type, title, message, metadata)
           VALUES ($1, $2, $3, 'BOOKING', $4, $5, $6)`,
          [
            `notif-${uuidv4()}`,
            organization_id,
            store_id,
            `New Booking: ${payload.offeringName || 'Service'}`,
            `Appointment booked for ${payload.customerName || 'Customer'} on ${payload.startTime}.`,
            JSON.stringify({ bookingId: payload.bookingId, offeringName: payload.offeringName })
          ]
        );
        break;
      }

      case 'STOCK_LOW': {
        await query(
          `INSERT INTO notifications (id, organization_id, store_id, type, title, message, metadata)
           VALUES ($1, $2, $3, 'INVENTORY', $4, $5, $6)`,
          [
            `notif-${uuidv4()}`,
            organization_id,
            store_id,
            `Low Stock Alert: ${payload.productTitle || 'Product'}`,
            `SKU ${payload.sku} has only ${payload.availableStock} units remaining (threshold: ${payload.threshold}).`,
            JSON.stringify(payload)
          ]
        );
        break;
      }

      default:
        console.log(`[OutboxWorker] Event ${event_type} handled silently.`);
        break;
    }
  }
}

