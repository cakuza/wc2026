let liveSnapshotPromise: Promise<any> | null = null;

export function fetchClientLiveSnapshot(): Promise<any> {
  if (!liveSnapshotPromise) {
    liveSnapshotPromise = fetch("/api/live-snapshot", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .finally(() => {
        liveSnapshotPromise = null;
      });
  }
  return liveSnapshotPromise;
}
