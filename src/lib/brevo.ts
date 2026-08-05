/**
 * Brevo (formerly Sendinblue) email integration for RouteX delivery notifications.
 *
 * Uses the Brevo Transactional Email API with an API key from the
 * environment variable VITE_BREVO_API_KEY. In production, this should
 * go through a server-side proxy to avoid exposing the key.
 */

const BREVO_KEY = import.meta.env["VITE_BREVO_API_KEY"] as string | undefined;

export const hasBrevoKey = Boolean(BREVO_KEY);

const API_URL = "https://api.brevo.com/v3/smtp/email";

export type DeliveryEmailParams = {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
};

export async function sendDeliveryEmail(
  params: DeliveryEmailParams,
): Promise<{ ok: boolean; error?: string }> {
  if (!BREVO_KEY) {
    return {
      ok: false,
      error: "Brevo API key not configured. Add VITE_BREVO_API_KEY to enable email sending.",
    };
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Jump City Inflatable Rentals",
          email: "dispatch@jumpcityinflatablerentals.com",
        },
        to: [{ email: params.toEmail, name: params.toName }],
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.message || `Brevo API returned ${res.status}`;
      return { ok: false, error: message };
    }

    return { ok: true };
  } catch (err) {
    console.error("[brevo] email send failed:", err);
    return { ok: false, error: "Failed to send email. Please try again." };
  }
}

export function buildDeliveryNotificationEmail(
  customerName: string,
  itemName: string,
  eventDate: string,
  deliveryWindow: string,
  estimatedArrival: string,
  driverName: string,
): string {
  return `
    <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f97316; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🚚 Your delivery is on the way!</h1>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #374151;">Hi ${customerName},</p>
        <p style="font-size: 16px; color: #374151;">
          Your <strong>${itemName}</strong> delivery is scheduled for <strong>${eventDate}</strong>.
        </p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Delivery window:</strong> ${deliveryWindow}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Estimated arrival:</strong> ${estimatedArrival}</p>
          <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Driver:</strong> ${driverName}</p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          If you have any questions, call us at (763) 555-0100.
        </p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
          — The Jump City Team
        </p>
      </div>
    </div>
  `;
}

export function buildRouteSummaryEmail(
  driverName: string,
  totalStops: number,
  totalDistance: string,
  totalDuration: string,
  stopsList: { address: string; customer: string; item: string }[],
): string {
  const stopsHtml = stopsList
    .map(
      (s, i) =>
        `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${i + 1}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.customer}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.item}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.address}</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f97316; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📋 Today's Delivery Route</h1>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #374151;">Hi ${driverName},</p>
        <p style="font-size: 16px; color: #374151;">Here's your optimized delivery route for today:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Total stops:</strong> ${totalStops}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Total distance:</strong> ${totalDistance}</p>
          <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Estimated time:</strong> ${totalDuration}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 8px; text-align: left; font-size: 14px; color: #374151;">#</th>
              <th style="padding: 8px; text-align: left; font-size: 14px; color: #374151;">Customer</th>
              <th style="padding: 8px; text-align: left; font-size: 14px; color: #374151;">Item</th>
              <th style="padding: 8px; text-align: left; font-size: 14px; color: #374151;">Address</th>
            </tr>
          </thead>
          <tbody>${stopsHtml}</tbody>
        </table>
        <p style="font-size: 14px; color: #6b7280;">Drive safe!</p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">— Jump City Dispatch</p>
      </div>
    </div>
  `;
}
