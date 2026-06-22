"use client";

import { use } from "react";

export default function SurveyLinksPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendor Links</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Generate and manage vendor-specific hashes for survey {resolvedParams.id}
          </p>
        </div>
      </div>
      <div className="rounded-md border bg-white dark:bg-slate-950 p-6 shadow-sm">
        <div className="text-sm text-slate-500">
          Table of vendor links and quota management goes here.
        </div>
      </div>
    </div>
  );
}
