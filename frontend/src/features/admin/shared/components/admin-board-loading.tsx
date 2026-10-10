import { AdminSectionHeading } from "./admin-section-heading";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function AdminBoardLoading({ eyebrow, title, description }: Props) {
  return (
    <div className="space-y-8">
      <AdminSectionHeading eyebrow={eyebrow} title={title} description={description} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="m-5 h-3 w-24 rounded-full bg-slate-200" />
            <div className="mx-5 mt-8 h-8 w-20 rounded-full bg-slate-200" />
            <div className="mx-5 mt-4 h-3 w-36 rounded-full bg-slate-100" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <aside className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm" />
          ))}
        </div>
      </section>
    </div>
  );
}
