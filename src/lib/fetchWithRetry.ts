export const fetchWithRetry = async (url: string | URL, init?: RequestInit): Promise<Response> => {
  const resp = await fetch(url, init);
  const respClone = resp.clone();

  if (resp.status === 429) {
    await new Promise<void>((resolve) => {
      window.setTimeout(() => {
        resolve();
      }, 10_000);
    });

    return fetchWithRetry(url, init);
  }

  return respClone;
};
