export const remoteFetch = async (url: string | URL, init: RequestInit = {}): Promise<Response> => {
  const patchedHeaders = new Headers(init.headers);
  patchedHeaders.set("user-agent", "Moddermore/noversion");
  init.headers = patchedHeaders;

  const resp = await fetch(url, init);
  const respClone = resp.clone();

  if (resp.status === 429) {
    await new Promise<void>((resolve) => {
      window.setTimeout(() => {
        resolve();
      }, 30_000);
    });

    return remoteFetch(url, init);
  }

  return respClone;
};
