import { ReactNode } from "react";

interface DashboardLayoutProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

const DashboardLayout = ({ title, actions, children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div>{actions}</div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
