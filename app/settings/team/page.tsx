import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { getUserRoleLabel } from "@/lib/format";

const members = [
  { name: "김민서", role: "REQUESTER", team: "마케팅" },
  { name: "박준호", role: "PR_REVIEWER", team: "PR" },
  { name: "최하린", role: "LEGAL_REVIEWER", team: "법무" },
  { name: "윤지수", role: "FINAL_APPROVER", team: "브랜드 오피스" },
];

export default function TeamSettingsPage() {
  return (
    <AppShell activePath="/settings/team">
      <PageHeader
        description="권한 기반 워크플로우를 보여주기 위한 모의 팀 설정 화면입니다."
        eyebrow="설정"
        title="팀 설정"
      />
      <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
          <div className="border-b border-[var(--color-hairline)] p-5">
            <h2 className="text-xl font-normal">검토 팀</h2>
          </div>
          <div className="divide-y divide-[var(--color-hairline)]">
            {members.map((member) => (
              <div
                className="flex min-w-0 items-center justify-between gap-4 p-5"
                key={member.name}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
                    {member.team}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap rounded-md bg-[var(--color-surface-soft)] px-2.5 py-1.5 text-xs font-medium">
                  {getUserRoleLabel(member.role)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
