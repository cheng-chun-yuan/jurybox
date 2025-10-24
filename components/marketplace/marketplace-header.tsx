export function MarketplaceHeader() {
  return (
    <section className="border-b border-border/50 bg-surface-1">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
          Browse Expert{' '}
          <span className="bg-linear-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
            AI Judges
          </span>
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl">
          Select up to 5 specialized judges to evaluate your work and provide detailed feedback
        </p>
      </div>
    </section>
  )
}
