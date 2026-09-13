export function BrandMark({ small = false }: { small?: boolean }) {
  return <svg width={small ? 26 : 35} height={small ? 30 : 40} viewBox="0 0 35 40" fill="none" aria-hidden="true"><path d="M3 37V8l28-5v34M17 6v31M3 21h28" stroke="currentColor" strokeWidth="1.6" /><path d="M8 37V13l5-1v25" fill="currentColor" fillOpacity=".25" /></svg>;
}
