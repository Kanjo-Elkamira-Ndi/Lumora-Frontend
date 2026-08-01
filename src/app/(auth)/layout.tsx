import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-neutral)]">
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-surface-2)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
          },
        }}
      />
    </div>
  );
}
