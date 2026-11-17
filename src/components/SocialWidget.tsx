/**
 * Social media index (DEMO numbers).
 * Later: fill this list from the Facebook Graph API (party Page posts: likes, comments, shares).
 * Tapping a post opens the link; on Android a facebook.com link opens the Facebook app.
 */
interface SocialPost { id: string; title: string; date: string; url: string; likes: number; comments: number; shares: number }

const DEMO_POSTS: SocialPost[] = [
  { id: 's1', title: 'District Padayatra on 25 Nov: all karyakartas join', date: '2026-11-16', url: 'https://www.facebook.com/', likes: 1240, comments: 186, shares: 342 },
  { id: 's2', title: 'Booth Sashaktikaran meeting in Naihati', date: '2026-11-14', url: 'https://www.facebook.com/', likes: 860, comments: 92, shares: 120 },
  { id: 's3', title: 'Yuva Morcha blood donation camp', date: '2026-11-12', url: 'https://www.facebook.com/', likes: 2105, comments: 301, shares: 515 },
];

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

export default function SocialWidget() {
  return (
    <section className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold">📣 Social media</h2>
        <span className="text-[10px] rounded-full bg-gray-100 text-mut px-2 py-0.5">Demo numbers</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x">
        {DEMO_POSTS.map((p) => (
          <a key={p.id} href={p.url} target="_blank" rel="noreferrer"
            className="snap-start shrink-0 w-64 rounded-2xl bg-white border border-line p-3 hover:border-[#1877F2]">
            <div className="flex items-center gap-2 text-[11px] text-mut">
              <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white grid place-items-center font-bold text-[12px]">f</span>
              {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
            <p className="mt-1.5 text-sm font-semibold line-clamp-2 min-h-10">{p.title}</p>
            <div className="mt-2 grid grid-cols-3 text-center text-xs">
              <div><b className="block text-sm">{fmt(p.likes)}</b>Likes</div>
              <div><b className="block text-sm">{fmt(p.comments)}</b>Comments</div>
              <div><b className="block text-sm">{fmt(p.shares)}</b>Shares</div>
            </div>
            <div className="mt-2 text-center text-xs font-semibold text-[#1877F2]">Open in Facebook ›</div>
          </a>
        ))}
      </div>
    </section>
  );
}
