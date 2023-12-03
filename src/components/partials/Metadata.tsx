import { BoxIcon, Clock10Icon, GlobeIcon, HeartIcon, LockIcon, ShieldIcon } from "lucide-react";
import { loaderFormat } from "~/lib/utils/strings";

import type { ModList, ModListWithExtraData } from "~/types/moddermore";

export const Metadata = ({ data }: { data: ModList | ModListWithExtraData }) => {
  return (
    <div className="metadata">
      <div>
        <BoxIcon className="text-christmas-green block h-4 w-4" />
        <span>
          For Minecraft <strong className="font-display">{data.gameVersion}</strong> with{" "}
          <strong className="font-display">{loaderFormat(data.modloader)}</strong>
        </span>
      </div>
      <div>
        <Clock10Icon className="text-christmas-red block h-4 w-4" />
        <span>
          Created <strong className="font-display">{new Date(data.created_at).toDateString()}</strong>
        </span>
      </div>

      {"likes" in data && (
        <div>
          <HeartIcon className="text-christmas-green block h-4 w-4" />
          <span className="font-display">
            <strong>{data.likes}</strong> {data.likes === 1 ? "like" : "likes"}
          </span>
        </div>
      )}

      <div>
        {data.visibility === "public" ? (
          <GlobeIcon className="text-christmas-red block h-4 w-4" />
        ) : data.visibility === "unlisted" ? (
          <ShieldIcon className="text-christmas-red block h-4 w-4" />
        ) : (
          <LockIcon className="text-christmas-red block h-4 w-4" />
        )}
        <strong className="font-display font-bold">
          {data.visibility[0].toUpperCase() + data.visibility.slice(1)}
        </strong>
      </div>
    </div>
  );
};
