"use client";

import { useEffect } from "react";
import { AccountSection } from "@/components/settings/page/AccountSection";
import { ProUpgradeSection } from "@/components/settings/page/ProUpgradeSection";
import { SettingsLayout } from "@/components/settings/SettingsLayout";

export function AccountPage() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const scrollToHash = () => {
      const { hash } = window.location;
      if (!hash) {
        return;
      }

      requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  // TODO: 扩展账户页面以包含订阅管理与使用情况统计。

  return (
    <SettingsLayout>
      <div className="space-y-8">
        <AccountSection />
        <ProUpgradeSection />
      </div>
    </SettingsLayout>
  );
}

export default AccountPage;
