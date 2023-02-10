import { MetaTags } from '@redwoodjs/web'

import PostListCell from 'src/components/Post/PostListCell'

const ListPage = () => {
  return (
    <>
      <MetaTags title="Posts" />
      <PostListCell />
    </>
  )
}

export default ListPage
