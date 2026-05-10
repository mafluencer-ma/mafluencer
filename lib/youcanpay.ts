import crypto from "crypto";

const BASE_URL = "https://youcanpay.com/api";

function pubKey() { return process.env.YOUCANPAY_PUBLIC_KEY ?? ""; }
function privKey() { return process.env.YOUCANPAY_PRIVATE_KEY ?? ""; }

export interface YouCanPayTransaction {
  amount: number;
  currency: "MAD";
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  successUrl: string;
  failureUrl: string;
  customerIp?: string;
}

export async function createTransaction(tx: YouCanPayTransaction): Promise<string> {
  const body = new URLSearchParams({
    pub_key: pubKey(),
    pri_key: privKey(),
    amount: String(Math.round(tx.amount * 100)),
    currency: tx.currency,
    order_id: tx.orderId + "-" + Date.now(),
    customer_ip: tx.customerIp ?? "127.0.0.1",
    success_url: tx.successUrl,
    error_url: tx.failureUrl,
    customer_info: JSON.stringify({
      name: tx.customerName,
      phone: tx.customerPhone ?? "",
      email: tx.customerEmail,
    }),
  });

  const res = await fetch(`${BASE_URL}/tokenize`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const rawText = await res.text();
  if (!res.ok) throw new Error(`YouCan Pay failed: ${res.status} ${rawText}`);

  const data = JSON.parse(rawText);
  const tokenId = typeof data.token === "object" ? data.token?.id : data.token;
  if (!tokenId) throw new Error(`YouCan Pay: no token — ${rawText}`);

  return `https://youcanpay.com/payment-form/${tokenId}`;
}

export function verifyWebhookSignature(
  transactionId: string,
  amount: string,
  currencyId: string,
  receivedHash: string
): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", privKey())
      .update(`${transactionId}${amount}${currencyId}`)
      .digest("hex");
    const expectedBuf = Buffer.from(expected, "hex");
    const receivedBuf = Buffer.from(receivedHash, "hex");
    if (expectedBuf.length !== receivedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch { return false; }
}
