import { type ReactNode } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { HeartIcon, ListIcon, UserIcon } from "lucide-react";
import { buttonVariants } from "../ui/Button";
import { GlobalLayout } from "./GlobalLayout";

interface Props {
  title: string;
  children: ReactNode;
}

const DashboardLink = ({ title, href, icon }: { title: string; href: string; icon: ReactNode }) => {
  const router = useRouter();

  return (
    <Link
      href={href}
      className={buttonVariants({
        variant: router.pathname.startsWith(href) ? "primary" : "secondary",
      })}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

// const FEEDBACK_LINK = "https://tally.so/r/mRM6AJ";

// const FeedbackPopup = () => {
//   const [show, setShow] = useState(false);

//   useEffect(() => {
//     const hideSetting = localStorage.getItem("hide-feedback-popup-v1");
//     if (hideSetting !== "true") setShow(true);
//   }, []);

//   const setToHide = useCallback(() => {
//     localStorage.setItem("hide-feedback-popup-v1", "true");
//     setShow(false);
//   }, []);

//   if (!show) return null;

//   return (
//     <div className="fixed bottom-0 right-0 m-2 flex flex-row items-center gap-x-2 rounded-sm bg-pink-500 px-2 py-1 text-white">
//       <a href={FEEDBACK_LINK} className="absolute inset-0 z-10" />
//       <span className="text-sm font-medium">We&apos;re collecting feedback!</span>
//       <button onClick={setToHide} className="z-20 p-0.5">
//         <XIcon className="block h-3 w-3" />
//       </button>
//     </div>
//   );
// };

export const DashboardLayout = ({ title, children }: Props) => {
  return (
    <GlobalLayout title={title} displayTitle={false} wideLayout>
      <div className="flex w-full flex-col md:flex-row">
        <div className="flex flex-col gap-y-2 border-neutral-100 p-4 dark:border-neutral-800 md:min-h-screen md:w-72 md:shrink-0 md:grow-0 md:border-r">
          <DashboardLink title="Lists" href="/lists" icon={<ListIcon className="block h-5 w-5" />} />
          <DashboardLink title="Likes" href="/likes" icon={<HeartIcon className="block h-5 w-5" />} />
          <DashboardLink title="Account" href="/account" icon={<UserIcon className="block h-5 w-5" />} />
        </div>
        <div className="w-full p-6">{children}</div>
      </div>
      {/* <FeedbackPopup /> */}
    </GlobalLayout>
  );
};
