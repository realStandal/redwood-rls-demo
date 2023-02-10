import type { ReactNode } from 'react'

import { useAuth } from 'src/lib/auth'

interface MainLayoutProps {
  children?: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { logOut } = useAuth()

  return (
    <div className="container mx-auto mt-8">
      <div className="flex items-center justify-end pb-6">
        <button
          className="text-blue-600 hover:text-blue-700 hover:underline"
          onClick={() => logOut()}
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  )
}

export default MainLayout
