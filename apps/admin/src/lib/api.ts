const KEY_STORAGE = "trackion_admin_key";

export function getAdminKey(): string {
  return sessionStorage.getItem(KEY_STORAGE) ?? "";
}

export function setAdminKey(key: string) {
  sessionStorage.setItem(KEY_STORAGE, key);
}

export async function adminFetch(path: string, init?: RequestInit) {
  const key = getAdminKey();
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
  return data;
}
