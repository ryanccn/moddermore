import type { RichModList } from '~/types/moddermore';

import { ExportStatus, exportZip, type PageStateHooks } from './shared';
import { saveAs } from 'file-saver';
import { getDownloadURLs } from '../upstream/download';
import JSZip from 'jszip';

export const zipExport = async ({
  data,
  setProgress,
  setResult,
  setStatus,
}: {
  data: RichModList;
} & PageStateHooks) => {
  setProgress({ value: 0, max: data.mods.length });
  setStatus(ExportStatus.Resolving);

  const urls = await getDownloadURLs(data, setProgress);

  setProgress({ value: 0, max: data.mods.length });
  setResult({ success: [], failed: [] });
  setStatus(ExportStatus.Downloading);

  const zipfile = new JSZip();

  await exportZip({ zipfile, urls, setProgress, setResult, setStatus });

  const zipBlob = await zipfile.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${data.title}.zip`);

  setStatus(ExportStatus.Result);
};
