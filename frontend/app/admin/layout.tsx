import Link from "next/link";
import { LayoutDashboard, FileText, Activity, History } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 flex-col hidden sm:flex border-r bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="">Survey Platform</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
            <Link
              href="/admin/surveys"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            >
              <FileText className="h-4 w-4" />
              Surveys
            </Link>
            <Link
              href="/admin/transactions"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            >
              <Activity className="h-4 w-4" />
              Transactions
            </Link>
            <Link
              href="/admin/legacy-logs"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            >
              <History className="h-4 w-4" />
              Legacy Logs
            </Link>
          </nav>
        </div>
      </aside>
      <div className="flex flex-col flex-1">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-white dark:bg-slate-900 px-6">
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg">Admin Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
