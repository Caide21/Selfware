import Link from "next/link";

export default function PageFrame({
  children,
  showBack = false,
  backHref = "/",
  backLabel = "← Back",
  showForward = false,
  forwardHref = "/",
  forwardLabel = "→ Continue",
}) {
  return (
    <div className="min-h-screen theme-bg theme-text transition-colors duration-300 flex flex-col overflow-x-hidden">
      <div className="w-full flex justify-between items-center px-4 sm:px-6 pt-6">
        {showBack ? (
          <Link href={backHref} className="text-sm font-medium text-fuchsia-600 hover:underline">
            {backLabel}
          </Link>
        ) : <div />}

        {showForward && (
          <Link href={forwardHref} className="text-sm font-medium text-fuchsia-600 hover:underline">
            {forwardLabel}
          </Link>
        )}
      </div>

      <main className="flex-1 px-4 sm:px-6 py-12">{children}</main>
    </div>
  );
}
