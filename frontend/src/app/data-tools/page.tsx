import RawApiConsole from "@/components/category/RawApiConsole";

const SAMPLE_HEALTH_JSON = JSON.stringify(
  {
    data: {
      metrics: [{ name: "step_count", units: "count", data: [{ date: "2026-03-06 00:00:00 +0000", qty: 8200 }] }],
      workouts: [],
    },
  },
  null,
  2
);

const SAMPLE_LOCATION_JSON = JSON.stringify(
  {
    _type: "location",
    lat: 47.9184,
    lon: 106.9177,
    tst: 1741219200,
    acc: 12,
  },
  null,
  2
);

export default function DataToolsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50 to-violet-50 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">Data Tools</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Raw Ingestion + API Explorer</h1>
        <p className="mt-2 text-sm text-slate-600">All upload and API-preview controls are centralized here to keep category pages focused and clean.</p>
      </section>

      <RawApiConsole category="Health" uploadMode="json" ingestPath="/api/v1/ingest/health" apiPath="/api/v1/dashboard/charts/health" sampleJson={SAMPLE_HEALTH_JSON} />

      <RawApiConsole category="Location" uploadMode="json" ingestPath="/api/v1/ingest/location" apiPath="/api/v1/dashboard/map" sampleJson={SAMPLE_LOCATION_JSON} />

      <RawApiConsole category="Finance CSV" uploadMode="csv" ingestPath="/api/v1/ingest/finance/csv" apiPath="/api/v1/dashboard/charts/finance" />

      <RawApiConsole category="Media CSV" uploadMode="csv" ingestPath="/api/v1/ingest/media/csv" apiPath="/api/v1/dashboard/media/recent" />
    </div>
  );
}
