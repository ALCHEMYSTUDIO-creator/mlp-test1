import type { ReactNode } from "react";

type MobileFrameProps = {
  children: ReactNode;
  title?: string;
};

export function MobileFrame({ children, title }: MobileFrameProps) {
  return (
    <main className="min-h-screen bg-[#f6efe3] px-4 py-6 text-[#2c251f] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[430px] flex-col overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-[#fffaf2] shadow-sm">
        {title ? (
          <header className="border-b border-[#efe3d2] px-5 py-4">
            <p className="text-sm font-semibold text-[#907960]">일그람</p>
            <h1 className="text-2xl font-bold tracking-normal text-[#2c251f]">
              {title}
            </h1>
          </header>
        ) : null}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
          {children}
        </div>
      </div>
    </main>
  );
}
