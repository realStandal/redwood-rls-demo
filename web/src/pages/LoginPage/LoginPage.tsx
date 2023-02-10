import { Form, Label, PasswordField, Submit, TextField } from '@redwoodjs/forms'
import { navigate, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { useAuth } from 'src/lib/auth'

interface LoginForm {
  username: string
  password: string
}

const LoginPage = () => {
  const { logIn } = useAuth()

  const onSubmit = async ({ password, username }: LoginForm) => {
    const res = await logIn({ password, username })

    if (res.error) {
      return toast.error(res.error)
    }

    navigate(routes.home())
  }

  return (
    <>
      <MetaTags title="Login" />
      <div className="m-6 mx-auto flex max-w-sm flex-col space-y-6 rounded-md bg-zinc-50 p-6 shadow">
        <h1 className="text-xl font-medium">Login</h1>
        <Form className="flex flex-col space-y-6" onSubmit={onSubmit}>
          <div className="flex flex-col space-y-3">
            <Label name="username">Username</Label>
            <TextField
              className="rounded border border-zinc-300 bg-transparent px-3.5 py-2"
              name="username"
            />
          </div>
          <div className="flex flex-col space-y-3">
            <Label name="password">Password</Label>
            <PasswordField
              className="rounded border border-zinc-300 bg-transparent px-3.5 py-2"
              name="password"
            />
          </div>
          <Submit className="ml-auto rounded bg-blue-500 px-3.5 py-2 font-medium tracking-wide text-white transition hover:bg-blue-600 active:bg-blue-700">
            Login
          </Submit>
        </Form>
      </div>
    </>
  )
}

export default LoginPage
