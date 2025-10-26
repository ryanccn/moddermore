export const remoteFetch = async (url: string | URL, init: RequestInit = {}): Promise<Response> => {
  const patchedHeaders = new Headers(init.headers);
  patchedHeaders.set("user-agent", "Moddermore/noversion");
  init.headers = patchedHeaders;

  let savedResp: Response | undefined;

  try {
    savedResp = await fetch(url, init);
  } catch {
    /* empty */
  }

  if (!savedResp || savedResp.status === 429) {
    await new Promise<void>((resolve) => {
      window.setTimeout(() => {
        resolve();
      }, 5000);
    });

    return remoteFetch(url, init);
  }

  return savedResp;
};
