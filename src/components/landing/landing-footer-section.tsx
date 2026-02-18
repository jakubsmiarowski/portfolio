export function LandingFooterSection() {
  return (
    <footer className="mt-16 border-t pt-6 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>© Kuba Smiarowski</p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/jakubsmiarowski"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/jakub-%C5%9Bmiarowski-779371104/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            LinkedIn
          </a>
          <a href="/admin" className="hover:text-foreground">
            Admin
          </a>
        </div>
      </div>
    </footer>
  )
}
