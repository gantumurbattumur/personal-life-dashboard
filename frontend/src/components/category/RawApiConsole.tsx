"use client";

import { useState } from "react";
import { fetchApiData, uploadCsv, uploadJson } from "@/lib/api";

type UploadMode = "json" | "csv" | "none";

interface RawApiConsoleProps {
  category: string;
  uploadMode: UploadMode;
  ingestPath?: string;
  apiPath: string;
  sampleJson?: string;
}

export default function RawApiConsole({
  category,
  uploadMode,
  ingestPath,
  apiPath,
  sampleJson,
}: RawApiConsoleProps) {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState(sampleJson || "{}");
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string>("Ready");
  const [apiResult, setApiResult] = useState<string>("Click load to fetch API data.");
  const [uploading, setUploading] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);

  const handleUpload = async () => {
    if (!ingestPath || uploadMode === "none") {
      setUploadResult("No Bronze ingest endpoint configured for this category.");
      return;
    }

    setUploading(true);
    try {
      if (uploadMode === "json") {
        const payload = JSON.parse(jsonText);
        const output = await uploadJson(ingestPath, payload);
        setUploadResult(JSON.stringify(output, null, 2));
      } else {
        if (!file) {
          setUploadResult("Please choose a CSV file.");
        } else {
          const output = await uploadCsv(ingestPath, file);
          setUploadResult(JSON.stringify(output, null, 2));
        }
      }
    } catch (error) {
      setUploadResult(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleLoadApi = async () => {
    setLoadingApi(true);
    try {
      const output = await fetchApiData(apiPath);
      setApiResult(JSON.stringify(output, null, 2));
    } catch (error) {
      setApiResult(error instanceof Error ? error.message : "API request failed");
    } finally {
      setLoadingApi(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h3 className="text-base font-semibold text-slate-900">{category} Data Tools</h3>
          <p className="text-xs text-slate-500">Raw ingestion + API preview controls</p>
        </div>
        <span className="text-sm text-slate-500">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="grid grid-cols-1 gap-4 border-t border-slate-200 p-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-800">Upload to Bronze</h4>
            <p className="mb-3 text-xs text-slate-500">Endpoint: {ingestPath || "N/A"}</p>

            {uploadMode === "json" && (
              <textarea
                value={jsonText}
                onChange={(event) => setJsonText(event.target.value)}
                className="h-44 w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700"
              />
            )}

            {uploadMode === "csv" && (
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-white"
              />
            )}

            {uploadMode === "none" && (
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500">
                This category currently has no direct raw ingestion endpoint.
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-70"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
              {uploadResult}
            </pre>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-800">Preview API Data</h4>
            <p className="mb-3 text-xs text-slate-500">Endpoint: {apiPath}</p>
            <button
              onClick={handleLoadApi}
              disabled={loadingApi}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-70"
            >
              {loadingApi ? "Loading..." : "Load API"}
            </button>
            <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
              {apiResult}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}
