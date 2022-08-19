# Why are list pages static?

Your edits might not reflect immediately on the lists page. And you will be perfectly justified in asking, _why do you cache list pages_?

The reason is, fetching the mod metadata from the Modrinth and CurseForge APIs takes quite a while. As you can observe for yourself, the first time you open a list takes quite a while to load.

If we do not cache this metadata, we will be stuck with a. loading spinners for 10+ seconds and high network waterfalls or b. 10 second TTFB, which is not optimal.

This is why we utilize Next.js's static site generation feature to statically generate the list pages. Lists are updated every 30 seconds, while 404 pages are updated every single second. In addition, after you submit an edit, the app will tell the server to update the page's data, so you can see the updates in approximately 10 seconds.

This is a necessary tradeoff between data freshness and user experience. With static site generation, every visit to your Moddermore list will be snappy and fast!
