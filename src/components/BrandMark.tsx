export function BrandMark({ small = false }: { small?: boolean }) {
  return <svg width={small ? 26 : 35} height={small ? 30 : 40} viewBox="0 0 35 40" fill="none" aria-hidden="true"><path d="M17.5 2 31 7.5V20c0 9-6.6 16.6-13.5 20-10.4-3.4-13.5-11-13.5-20V7.5Z" stroke="currentColor" strokeWidth="1.6" /><path d="m11.5 19.5 4.5 4.5 8-8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
