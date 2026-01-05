import { cn } from "@/lib/utils";
import { Container } from "./container";

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageShell({ children, className, ...props }: PageShellProps) {
  return (
    <div className={cn("min-h-screen py-12 lg:py-20", className)} {...props}>
      <Container>{children}</Container>
    </div>
  );
}
