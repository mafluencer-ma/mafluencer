interface TokenizeBody {
  order_id: string;
  amount: number;       // in centimes (MAD × 100)
  currency: "MAD";
  customer_ip: string;
  success_url: string;
  error_url: string;
  customer_info?: { name?: string; email?: string };
}

function getConfig() {
  const isSandbox = process.env.YOUCAN_PAY_IS_SANDBOX === "true";
  return {
    isSandbox,
    apiBase:    isSandbox ? "https://youcanpay.com/sandbox/api"          : "https://youcanpay.com/api",
    formBase:   isSandbox ? "https://youcanpay.com/sandbox/payment-form" : "https://youcanpay.com/payment-form",
    pubKey:     process.env.YOUCAN_PAY_PUBLIC_KEY  ?? "",
    privateKey: process.env.YOUCAN_PAY_PRIVATE_KEY ?? "",
    appUrl:     process.env.NEXTAUTH_URL           ?? "https://mafluencer.ma",
  };
}

export async function createPaymentToken(body: TokenizeBody): Promise<{ token: string; paymentUrl: string }> {
  const { apiBase, formBase, pubKey, privateKey, isSandbox } = getConfig();

  if (!privateKey) throw new Error("YOUCAN_PAY_PRIVATE_KEY is not set");

  console.log("[YouCan Pay] isSandbox:", isSandbox, "apiBase:", apiBase);
  console.log("[YouCan Pay] pubKey:", pubKey ? pubKey.slice(0, 20) + "…" : "EMPTY");

  const requestBody = { ...body, pri_key: privateKey, pub_key: pubKey };
  console.log("[YouCan Pay] tokenize request body:", JSON.stringify({ ...requestBody, pri_key: "***", pub_key: pubKey }));

  const res = await fetch(`${apiBase}/tokenize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const rawText = await res.text();
  console.log("[YouCan Pay] tokenize response:", rawText);

  if (!res.ok) {
    throw new Error(`YouCan Pay tokenize error ${res.status}: ${rawText}`);
  }

  const data = JSON.parse(rawText) as Record<string, unknown>;

  // Extract token — handle both { token: { id } } and flat { token: "..." } shapes
  const tokenObj = data.token as Record<string, unknown> | string | undefined;
  const token = (
    typeof tokenObj === "string" ? tokenObj :
    typeof tokenObj === "object" && tokenObj !== null ? (tokenObj.id as string) :
    data.token_id as string | undefined
  );

  if (!token) {
    throw new Error(`YouCan Pay: could not extract token. Full response: ${rawText}`);
  }

  const paymentUrl = `${formBase}/${token}?pub_key=${pubKey}&lang=fr`;
  console.log("[YouCan Pay] paymentUrl:", paymentUrl);

  return { token, paymentUrl };
}

export function paymentRedirectUrls(transactionId: string) {
  const { appUrl } = getConfig();
  return {
    success_url: `${appUrl}/dashboard/brand/billing/success?ref=${transactionId}`,
    error_url:   `${appUrl}/dashboard/brand/billing/error?ref=${transactionId}`,
  };
}
