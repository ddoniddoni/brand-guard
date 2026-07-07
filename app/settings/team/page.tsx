import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { getUserRoleLabel } from "@/lib/format";

const members = [
  { name: "김민서", role: "MARKETER", team: "Marketing" },
  { name: "박준호", role: "PR_REVIEWER", team: "PR" },
  { name: "최하린", role: "LEGAL_REVIEWER", team: "Legal" },
  { name: "윤지수", role: "FINAL_APPROVER", team: "Brand Office" },
];

export default function TeamSettingsPage() {
  return (
    <AppShell activePath="/settings/team">
      <PageHeader
        description="권한 기반 워크플로우를 보여주기 위한 mock 팀 설정 화면입니다."
        eyebrow="Settings"
        title="팀 설정"
      />
      <div className="px-6 py-6 sm:px-8">
        <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
          <div className="border-b border-[var(--color-hairline)] p-5">
            <h2 className="text-xl font-normal">검토 팀</h2>
          </div>
          <div className="divide-y divide-[var(--color-hairline)]">
            {members.map((member) => (
              <div
                className="flex items-center justify-between gap-4 p-5"
                key={member.name}
              >
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {member.team}
                  </p>
                </div>
                <span className="rounded-md bg-[var(--color-surface-soft)] px-2.5 py-1.5 text-xs font-medium">
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
