import { useCallback, useEffect, useState } from "react";

const KOFI_URL = "https://ko-fi.com/RyanCaoDev";

const LOCALSTORAGE_ID_OLD = ["5075C136-C8DD-4947-BFE4-904661CA30D2", "9CEA7E71-0129-4264-B78F-2330CBF172CA"];
const LOCALSTORAGE_ID = "EE54D829-47EA-4EF1-A1F0-7F9A1BE65AE2";

export const DonationMessage = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    for (const old of LOCALSTORAGE_ID_OLD) localStorage.removeItem(old);
    if (localStorage.getItem(LOCALSTORAGE_ID) !== "true") setShow(true);
  }, []);

  const dontShowAgain = useCallback(() => {
    localStorage.setItem(LOCALSTORAGE_ID, "true");
    setShow(false);
  }, []);

  if (!show) return null;

  return (
    <div className="not-prose flex flex-col rounded-lg bg-neutral-100 p-8 dark:bg-neutral-800">
      <h2 className="mb-4 font-display text-2xl font-extrabold">We need your help!</h2>

      <p className="mb-6">
        Moddermore currently runs completely without revenue, free for anyone to create an account and use all
        the features without any hindrance. As a result, we rely completely on donations to cover our hosting
        costs. In addition, we have poured countless hours into making Moddermore one of the best services out
        there. So please, donate if you have some money spare - every dollar counts!
      </p>

      <a
        className="self-start rounded-lg bg-yellow-500 px-6 py-3 font-display text-lg font-medium text-white transition-shadow focus:ring-yellow-500/30"
        href={KOFI_URL}
      >
        Donate
      </a>

      <button
        className="mt-6 self-start text-xs font-medium opacity-25 transition-opacity hover:opacity-50"
        onClick={dontShowAgain}
      >
        Don&apos;t show again 😭
      </button>
    </div>
  );
};
