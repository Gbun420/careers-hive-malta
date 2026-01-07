import * as React from "react";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string | null;
};

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export function SafeExternalLink({ href, children, ...rest }: Props) {
  // If href is missing, DO NOT render an anchor with target=_blank (that opens about:blank)
  if (!href || typeof href !== "string" || href.trim().length === 0) {
    return (
      <span className={`text-slate-400 cursor-not-allowed ${rest.className || ""}`} aria-disabled="true">
        {children}
      </span>
    );
  }

  // If it's not actually external, never open a new tab
  if (!isExternalHref(href)) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  );
}
