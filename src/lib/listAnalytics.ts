import { format, subDays } from "date-fns";

export type ListTimeseriesData = {
  date: string;

  visitors: number;
  visits: number;
  pageviews: number;
  bounce_rate: number;
}[];

export const getListTimeseries = async (id: string) => {
  if (!process.env.PLAUSIBLE_TOKEN) return null;

  if (process.env.NODE_ENV === "development") {
    const ret: ListTimeseriesData = [];

    for (let i = 29; i >= 0; i--) {
      ret.push({
        date: format(subDays(new Date(), i), "MMM dd"),
        visitors: 250 + Math.floor(Math.random() * 500),
        visits: 300 + Math.floor(Math.random() * 750),
        bounce_rate: Math.random() * 100,
        pageviews: 500 + Math.floor(Math.random() * 1000),
      });
    }

    return ret;
  }

  const data = await fetch(
    `https://plausible.io/api/v1/stats/timeseries?site_id=moddermore.net&period=30d&metrics=pageviews,visitors,visits,bounce_rate&filters=${
      encodeURIComponent(`event:page==/list/${id}`)
    }`,
    {
      headers: { Authorization: `Bearer ${process.env.PLAUSIBLE_TOKEN}` },
    },
  ).then(async (r) => {
    if (!r.ok) {
      throw new Error(
        `Error fetching ${r.url}: ${r.status} ${r.statusText}\n${await r.text()}`,
      );
    }

    return r.json() as Promise<{ results: ListTimeseriesData }>;
  });

  return data.results;
};
