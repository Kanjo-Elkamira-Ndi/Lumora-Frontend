import { MarketingNav } from "@/components/marketing/marketingNav";
import { MarketingFooter } from "@/components/marketing/marketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-neutral)]">
      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  );
}
