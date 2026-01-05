import { cn } from "@/lib/utils";

interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 mb-8",
        align === "center" && "items-center text-center",
        className
      )}
      {...props}
    >
      <h2 className="text-3xl font-black tracking-tightest text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg font-medium text-slate-500 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
