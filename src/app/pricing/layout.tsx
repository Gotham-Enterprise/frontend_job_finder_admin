export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout inherits from the root layout but ensures no admin sidebar/header
  return <div className="min-h-screen">{children}</div>;
}
