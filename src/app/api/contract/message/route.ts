type ContractMessagePayload = {
  reference?: string;
  clientEmail?: string;
  projectTitle?: string;
  message?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ContractMessagePayload;

  if (!payload.reference || !payload.clientEmail || !payload.projectTitle || !payload.message?.trim()) {
    return Response.json({ error: "A contract comment is required." }, { status: 400 });
  }

  return Response.json({ delivered: false, demo: true }, { status: 202 });
}
