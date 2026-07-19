type CheckoutPayload = {
  reference?: string;
  clientEmail?: string;
  projectTitle?: string;
  total?: number;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as CheckoutPayload;

  if (!payload.reference || !payload.clientEmail || !payload.projectTitle || !payload.total || payload.total <= 0) {
    return Response.json({ error: "Invalid checkout details." }, { status: 400 });
  }

  return Response.json({ demo: true });
}
