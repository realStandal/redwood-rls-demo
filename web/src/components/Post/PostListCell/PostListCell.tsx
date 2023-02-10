import type { PostListQuery } from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

export const QUERY = gql`
  query PostListQuery {
    posts {
      id
      title
      body
      user {
        username
      }
    }
  }
`

export const Loading = () => <p>Loading...</p>

export const Empty = () => <p>No post found</p>

export const Failure = ({ error }: CellFailureProps) => <p>{error?.message}</p>

export const Success = ({ posts }: CellSuccessProps<PostListQuery>) => {
  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <div className="space-y-2" key={post.id}>
          <div className="flex flex-row items-center space-x-4">
            <h2 className="text-lg font-medium">{post.title}</h2>
            <p className="text-sm text-zinc-600">by {post.user.username}</p>
          </div>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  )
}
