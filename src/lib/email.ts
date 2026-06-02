import { Resend } from "resend";

export type AdminNotificationKind = "sublease" | "listing" | "moveout_sale";

const FROM = "onboarding@resend.dev";

function subjectForKind(kind: AdminNotificationKind): string {
  const label =
    kind === "sublease"
      ? "sublease"
      : kind === "listing"
        ? "listing"
        : "move-out sale";
  return `New ${label} submitted on ASU Orbit`;
}

/**
 * Sends a plain-text alert to ADMIN_EMAIL when content is submitted.
 * Never throws; logs errors if the key is missing or Resend fails.
 */
export async function sendAdminNotification(options: {
  kind: AdminNotificationKind;
  bodyLines: string[];
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ADMIN_EMAIL?.trim();
  if (!apiKey || !to) {
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const text = options.bodyLines.join("\n");
    const { error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: subjectForKind(options.kind),
      text,
    });
    if (error) {
      console.error("sendAdminNotification Resend error:", error);
    }
  } catch (err) {
    console.error("sendAdminNotification error:", err);
  }
}
