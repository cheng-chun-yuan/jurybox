export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin" />
        <p className="text-foreground/60">Loading...</p>
      </div>
    </div>
  )
}
