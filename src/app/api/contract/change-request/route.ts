type ChangeRequestPayload = {
  reference?: string;
  freelancerEmail?: string;
  clientEmail?: string;
  projectTitle?: string;
  scope?: string;
  deadline?: string;
  revisions?: string;
  proposedAmount?: number;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ChangeRequestPayload;

  if (
    !payload.reference ||
    !payload.freelancerEmail ||
    !payload.clientEmail ||
    !payload.projectTitle ||
    !payload.scope ||
    !payload.deadline ||
    !payload.revisions ||
    !Number.isFinite(payload.proposedAmount)
  ) {
    return Response.json({ error: "Complete all required contract changes." }, { status: 400 });
  }

  return Response.json({ delivered: false, demo: true }, { status: 202 });
}
