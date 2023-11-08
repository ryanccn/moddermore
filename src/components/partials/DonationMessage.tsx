import { useCallback, useEffect, useState } from "react";

const LEMONSQUEEZY_URL =
  "https://moddermore.lemonsqueezy.com/checkout/buy/4c187f24-0c1f-4468-b7f1-c2a06057a318";
const KOFI_URL = "https://ko-fi.com/RyanCaoDev";

const LOCALSTORAGE_ID = "1251279C-5C7B-4EE8-AE2A-3254EE386C77";

const donateButtonClassName =
  "self-start rounded-lg bg-yellow-500 px-6 py-3 text-lg font-medium text-white transition-shadow focus:ring-yellow-500/30 font-display";

export const DonationMessage = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(LOCALSTORAGE_ID) !== "true") setShow(true);
  }, []);

  const dontShowAgain = useCallback(() => {
    localStorage.setItem(LOCALSTORAGE_ID, "true");
    setShow(false);
  }, []);

  if (!show) return null;

  return (
    <div className="not-prose flex flex-col rounded-lg bg-neutral-100 p-8 dark:bg-neutral-800">
      <h2 className="font-display mb-5 text-2xl font-extrabold">We need your help!</h2>
      <p className="mb-10 text-sm">
        Moddermore currently runs completely without revenue, free for anyone to create an account and use all
        the features without any hindrance. As a result, we rely completely on donations to cover our hosting
        costs. In addition, we have poured countless hours into making Moddermore one of the best services out
        there. So please, donate if you have some money spare - every dollar counts!
      </p>

      <div className="flex flex-col gap-y-4 lg:flex-row lg:gap-x-6">
        <div className="flex flex-col gap-y-2">
          <a className={donateButtonClassName} href={LEMONSQUEEZY_URL}>
            Donate via Lemon Squeezy
          </a>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Higher fees, more payments methods
          </p>
        </div>
        <div className="flex flex-col gap-y-2">
          <a className={donateButtonClassName} href={KOFI_URL}>
            Donate via Ko-Fi
          </a>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Lower fees, only PayPal
          </p>
        </div>
      </div>

      <button
        className="mt-8 self-start text-xs font-medium opacity-25 transition-opacity hover:opacity-50"
        onClick={dontShowAgain}
      >
        Don&apos;t show again 😭
      </button>
    </div>
  );
};
