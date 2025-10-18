import type { ReactNode } from "react";
import Navigation from "@/components/ui/Navigation";

interface PlayerPageLayoutProps {
  subtitleContainerId: string;
  children: ReactNode;
  footer?: ReactNode;
  showFooter?: boolean;
}

export function PlayerPageLayout({
  subtitleContainerId,
  children,
  footer,
  showFooter = false,
}: PlayerPageLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <header className="fixed top-3 sm:top-4 left-1/2 z-20 -translate-x-1/2">
        <Navigation />
      </header>

      <main
        id={subtitleContainerId}
        className="flex-1 overflow-y-auto safe-area-inset-top"
        style={{
          paddingBottom: showFooter
            ? "var(--space-player-controls)"
            : "var(--space-player-content)",
        }}
      >
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 mt-24">
          <div className="mx-auto max-w-4xl">
            {/* 使用与首页一致的间距系统 */}
            <div className="space-y-8">{children}</div>
          </div>
        </div>
      </main>

      {showFooter && footer && (
        <footer className="flex-shrink-0 safe-area-inset-bottom">{footer}</footer>
      )}
    </div>
  );
}
