import { Router, Route, Set } from '@redwoodjs/router'

import MainLayout from 'src/layouts/MainLayout'
import { useAuth } from 'src/lib/auth'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <Route notfound page={NotFoundPage} />
      <Route path="/login" page={LoginPage} name="login" />
      <Set private unauthenticated="login" wrap={[MainLayout]}>
        <Route path="/" page={HomePage} name="home" />
        <Route path="/posts" page={PostListPage} name="posts" />
      </Set>
    </Router>
  )
}

export default Routes
