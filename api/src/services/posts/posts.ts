import type {
  QueryResolvers,
  MutationResolvers,
  PostRelationResolvers,
} from 'types/graphql'

export const posts: QueryResolvers['posts'] = () => {
  return context.db.post.findMany()
}

export const post: QueryResolvers['post'] = ({ id }) => {
  return context.db.post.findUnique({
    where: { id },
  })
}

export const createPost: MutationResolvers['createPost'] = ({ input }) => {
  return context.db.post.create({
    data: input,
  })
}

export const updatePost: MutationResolvers['updatePost'] = ({ id, input }) => {
  return context.db.post.update({
    data: input,
    where: { id },
  })
}

export const deletePost: MutationResolvers['deletePost'] = ({ id }) => {
  return context.db.post.delete({
    where: { id },
  })
}

export const Post: PostRelationResolvers = {
  user: (_obj, { root }) => {
    return context.db.post.findUnique({ where: { id: root?.id } }).user()
  },
  tenant: (_obj, { root }) => {
    return context.db.post.findUnique({ where: { id: root?.id } }).tenant()
  },
}
