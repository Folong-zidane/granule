export function StatsSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">DocEnseignant en chiffres</h2>
            <p className="max-w-[900px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Rejoignez notre communauté d'enseignants et d'élèves.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-5xl font-bold">5,000+</span>
            <span className="text-xl text-primary-foreground/80">Enseignants actifs</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <span className="text-5xl font-bold">50,000+</span>
            <span className="text-xl text-primary-foreground/80">Élèves inscrits</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <span className="text-5xl font-bold">100,000+</span>
            <span className="text-xl text-primary-foreground/80">Cours créés</span>
          </div>
        </div>
      </div>
    </section>
  )
}
