export function AgentFormHeader() {
  return (
    <section className="border-b border-border/50 bg-surface-1">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
          Create Your{' '}
          <span className="bg-linear-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
            AI Judge
          </span>
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl">
          Configure your specialized AI judge with custom expertise, pricing, and evaluation criteria
        </p>
      </div>
    </section>
  )
}
