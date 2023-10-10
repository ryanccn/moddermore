import { type GetServerSideProps, type NextPage } from "next";

import { useCallback, useEffect, useState } from "react";

import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { authOptions } from "~/lib/authOptions";

import { ArrowLeftIcon, RefreshCw } from "lucide-react";
import Link from "next/link";
import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { Spinner } from "~/components/partials/Spinner";
import { Button } from "~/components/ui/Button";

import { getSpecificList } from "~/lib/db";
import { type ListTimeseriesData } from "~/lib/listAnalytics";

import { AreaChart } from "@tremor/react";
import type { ModList } from "~/types/moddermore";

interface PageProps {
  data: ModList;
}

const numberFormatter = (number: number) => {
  return Intl.NumberFormat("us").format(number).toString();
};

const percentageFormatter = (number: number) => {
  return number.toFixed(2) + "%";
};

const ListAnalytics: NextPage<PageProps> = ({ data }) => {
  useSession({ required: true });

  const [loading, setLoading] = useState(false);
  const [timeseriesData, setTimeseriesData] = useState<ListTimeseriesData | null>(null);

  const updateData = useCallback(() => {
    setLoading(true);
    fetch(`/api/list/${data.id}/analytics`)
      .then((res) => res.json() as Promise<{ timeseries: ListTimeseriesData }>)
      .then(({ timeseries }) => {
        setTimeseriesData(timeseries);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [data.id]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  return (
    <GlobalLayout title={`Analytics for ${data.title}`} className="px-8 py-20 md:px-16" wideLayout>
      <Link href={`/list/${data.id}`} className="mb-8 flex flex-row items-center gap-x-1">
        <ArrowLeftIcon className="block h-3 w-3" />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Back</span>
      </Link>

      <Button variant="primary" className="mb-12 self-end" disabled={loading} onClick={updateData}>
        {loading ? <Spinner className="block h-4 w-4" /> : <RefreshCw className="block h-4 w-4" />}
        <span>Refresh data</span>
      </Button>

      {timeseriesData && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AreaChart
            className="h-96"
            data={timeseriesData}
            index="date"
            categories={["pageviews"]}
            colors={["indigo"]}
            valueFormatter={numberFormatter}
          />
          <AreaChart
            className="h-96"
            data={timeseriesData}
            index="date"
            categories={["visits"]}
            colors={["emerald"]}
            valueFormatter={numberFormatter}
          />
          <AreaChart
            className="h-96"
            data={timeseriesData}
            index="date"
            categories={["visitors"]}
            colors={["cyan"]}
            valueFormatter={numberFormatter}
          />
          <AreaChart
            className="h-96"
            data={timeseriesData}
            index="date"
            categories={["bounce_rate"]}
            colors={["rose"]}
            valueFormatter={percentageFormatter}
          />
        </div>
      )}
    </GlobalLayout>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps | { notFound: true }> = async ({
  query,
  req,
  res,
}) => {
  if (typeof query.id !== "string") throw new Error("?");
  const data = await getSpecificList(query.id);

  if (!data || data.ownerProfile.banned) {
    return {
      notFound: true,
    };
  }

  const sess = await getServerSession(req, res, authOptions);
  if (sess?.user.id !== data.owner && !sess?.extraProfile.isAdmin) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      data: { ...data },
    },
  };
};

export default ListAnalytics;
