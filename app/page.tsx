export default function Home() {
  const reviewQueue = [
    {
      name: "Summer launch visual",
      brand: "Northstar",
      status: "AI 검토 완료",
      risk: "중간 위험",
    },
    {
      name: "Holiday push copy",
      brand: "Luma",
      status: "PR 검토",
      risk: "검토 필요",
    },
    {
      name: "Offline poster v2",
      brand: "Atelier",
      status: "수정 요청",
      risk: "낮은 위험",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8">
        <header className="flex h-16 items-center justify-between border-b border-[var(--color-hairline)]">
          <div>
            <p className="text-sm font-medium text-[var(--color-muted)]">
              BrandGuard
            </p>
            <h1 className="text-2xl font-normal leading-tight">
              캠페인 사전 검토
            </h1>
          </div>
          <button className="min-h-12 rounded-xl bg-[var(--color-primary)] px-6 text-base font-medium text-white">
            분석 요청
          </button>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Review queue
                </p>
                <h2 className="mt-2 text-3xl font-normal leading-tight">
                  공개 전 리스크 후보를 한곳에서 검토합니다.
                </h2>
              </div>
              <span className="rounded-md bg-[var(--color-risk-medium-bg)] px-3 py-2 text-sm font-medium text-[var(--color-risk-medium-text)]">
                사람 검토 권장
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-[var(--color-hairline)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">캠페인</th>
                    <th className="px-4 py-3 font-medium">브랜드</th>
                    <th className="px-4 py-3 font-medium">상태</th>
                    <th className="px-4 py-3 font-medium">리스크</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewQueue.map((campaign) => (
                    <tr
                      className="border-t border-[var(--color-hairline)]"
                      key={campaign.name}
                    >
                      <td className="px-4 py-4 font-medium">{campaign.name}</td>
                      <td className="px-4 py-4 text-[var(--color-body)]">
                        {campaign.brand}
                      </td>
                      <td className="px-4 py-4 text-[var(--color-body)]">
                        {campaign.status}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-[var(--color-risk-low-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-risk-low-text)]">
                          {campaign.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-xl bg-[var(--color-review-canvas)] p-6 text-white">
            <p className="text-sm font-medium text-white/70">
              Image review surface
            </p>
            <div className="mt-6 aspect-[4/3] rounded-lg border border-white/15 bg-[var(--color-review-canvas-panel)] p-4">
              <div className="relative h-full rounded-md border border-white/10 bg-white/5">
                <div className="absolute left-[52%] top-[24%] h-[34%] w-[24%] rounded-md border-2 border-[var(--color-review-overlay-hand)] bg-[var(--color-review-overlay-hand)]/10" />
                <div className="absolute left-[14%] top-[66%] h-[12%] w-[58%] rounded-md border-2 border-[var(--color-review-overlay-ocr)] bg-[var(--color-review-overlay-ocr)]/10" />
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-white p-4 text-[var(--color-ink)]">
              <p className="text-sm font-medium">손동작 후보 검토 필요</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
                일부 시각 패턴과 유사하게 해석될 가능성이 있어 맥락
                확인이 필요합니다. 이 결과는 의도나 성향을 판정하지
                않습니다.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
