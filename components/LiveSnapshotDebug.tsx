export function LiveSnapshotDebug({
  snapshotId,
  generatedAt,
}: {
  snapshotId: string;
  generatedAt: string;
}) {
  return (
    <div
      hidden
      data-live-snapshot-id={snapshotId}
      data-live-snapshot-generated-at={generatedAt}
    />
  );
}
