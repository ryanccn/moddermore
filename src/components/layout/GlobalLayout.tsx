import { Footer } from "./Footer";
import { Header } from "./Header";

import { type ReactNode } from "react";

import { twMerge } from "tailwind-merge";

interface Props {
  title: string;
  titleIcon?: ReactNode;
  className?: string;
  displayTitle?: boolean | string;
  wideLayout?: boolean;
  isAuthPage?: boolean;
  children: ReactNode | ReactNode[];
}

export const GlobalLayout = ({
  title,
  titleIcon,
  displayTitle = true,
  wideLayout = false,
  isAuthPage = false,
  className,
  children,
}: Props) => {
  return (
    <>
      <Header />

      <main
        className={twMerge(
          wideLayout
            ? "flex min-h-screen flex-col px-8 py-36 lg:p-36"
            : isAuthPage
              ? "-mt-16 grid min-h-screen place-content-center"
              : "layout mt-28",
          className,
        )}
      >
        {displayTitle === true ? (
          <>
            {titleIcon}
            <h1 className="title">{title}</h1>
          </>
        ) : typeof displayTitle === "string" ? (
          <>
            {titleIcon}
            <h1 className="title">{displayTitle}</h1>
          </>
        ) : null}

        {children}
      </main>

      <Footer />
    </>
  );
};
