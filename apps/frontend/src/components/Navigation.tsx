export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <img
                src="/src/assets/cube-logo.svg"
                alt="Cube Logo"
                className="h-8 w-8"
              />
            </div>
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                Fullstack Cloudflare Boilerplate
              </h1>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
