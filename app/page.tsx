import { connection } from "next/server";
import { Suspense } from "react";

import { AppClient } from "@/components/AppClient";
import { RealtimeRoot } from "@/components/RealtimeRoot";
import { getEnv } from "@/lib/env";
import { loadInterests } from "@/lib/interests";

async function Signups() {
  await connection();
  const { rows, sealedQuery } = await loadInterests();
  return (
    <RealtimeRoot
      key={sealedQuery.queryFingerprint}
      url={getEnv().realtimeUrl}
    >
      <AppClient initialInterests={rows} sealedQuery={sealedQuery} />
    </RealtimeRoot>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading the B20 agenda</p>}>
      <Signups />
    </Suspense>
  );
}
