export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Deep Agent</h1>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
