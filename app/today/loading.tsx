// Today is statically rendered from the canonical archive snapshot. Do not
// stream a separate loading shell into exported HTML, because it would diverge
// from the phase-aware Match Center content used after hydration.
export default function TodayLoading() {
  return null;
}
