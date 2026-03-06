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
    const [jsonText, setJsonText] = useState(sampleJson || "{}");
    const [file, setFile] = useState<File | null>(null);
    const [uploadResult, setUploadResult] = useState<string>("");
    const [apiResult, setApiResult] = useState<string>("{}");
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [loadingApi, setLoadingApi] = useState(false);

    const handleUpload = async () => {
        if (!ingestPath || uploadMode === "none") {
            setUploadResult("Raw upload is not available for this category in Bronze layer.");
            return;
        }

        setLoadingUpload(true);
        setUploadResult("");
        try {
            if (uploadMode === "json") {
                const payload = JSON.parse(jsonText);
                const result = await uploadJson(ingestPath, payload);
                setUploadResult(JSON.stringify(result, null, 2));
            } else if (uploadMode === "csv") {
                if (!file) {
                    setUploadResult("Please choose a CSV file first.");
                } else {
                    const result = await uploadCsv(ingestPath, file);
                    setUploadResult(JSON.stringify(result, null, 2));
                }
            }
        } catch (error) {
            setUploadResult(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setLoadingUpload(false);
        }
    };

    const handleFetchApi = async () => {
        setLoadingApi(true);
        try {
            const result = await fetchApiData(apiPath);
            setApiResult(JSON.stringify(result, null, 2));
        } catch (error) {
            setApiResult(error instanceof Error ? error.message : "Fetch failed");
        } finally {
            setLoadingApi(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-200 mb-2">Raw Data Upload ({category})</h3>
                <p className="text-xs text-gray-500 mb-3">Send data into Bronze layer ingestion endpoints.</p>

                {uploadMode === "json" && (
                    <textarea
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        className="w-full h-40 bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs text-gray-200"
                    />
                )}

                {uploadMode === "csv" && (
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-white"
                    />
                )}

                {uploadMode === "none" && (
                    <div className="text-sm text-gray-500 rounded-lg border border-gray-800 bg-gray-950 p-3">
                        No direct Bronze raw ingestion endpoint for this category yet.
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={loadingUpload}
                    className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-500 disabled:opacity-60"
                >
                    {loadingUpload ? "Uploading..." : "Upload to Raw"}
                </button>

                <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-300">
                    {uploadResult || "Upload response will appear here."}
                </pre>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-200 mb-2">API Data</h3>
                <p className="text-xs text-gray-500 mb-3">Read the current API output for this category.</p>

                <button
                    onClick={handleFetchApi}
                    disabled={loadingApi}
                    className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-60"
                >
                    {loadingApi ? "Loading..." : `Load ${apiPath}`}
                </button>

                <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-300">
                    {apiResult}
                </pre>
            </div>
        </div>
    );
}
