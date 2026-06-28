export function JackieLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-950 text-sm font-semibold tracking-tight text-white">
        JJ
      </div>
      <span className="font-serif text-lg tracking-tight text-indigo-950">
        Jackie Jeans
      </span>
    </div>
  );
}
