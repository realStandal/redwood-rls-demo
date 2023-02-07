import { Router, Route } from '@redwoodjs/router'

import { useAuth } from 'src/lib/auth'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
