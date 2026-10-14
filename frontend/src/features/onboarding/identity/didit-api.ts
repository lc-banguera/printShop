const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function authorization(accessToken?: string): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

async function readResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'No fue posible continuar con la verificación.');
  return body;
}

export async function createDiditSession(accessToken?: string): Promise<{ verificationUrl: string }> {
  const response = await fetch(`${API_BASE_URL}/api/didit/session`, {
    method: 'POST',
    headers: { ...authorization(accessToken) },
    credentials: 'include',
  });
  return readResponse(response);
}

export async function getDiditStatus(accessToken?: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/api/didit/status`, {
    headers: { ...authorization(accessToken) },
    credentials: 'include',
  });
  return readResponse(response);
}
