import type {
  QueryResolvers,
  MutationResolvers,
  UserRelationResolvers,
} from 'types/graphql'

export const users: QueryResolvers['users'] = () => {
  return context.db.user.findMany()
}

export const user: QueryResolvers['user'] = ({ id }) => {
  return context.db.user.findUnique({
    where: { id },
  })
}

export const updateUser: MutationResolvers['updateUser'] = ({ id, input }) => {
  return context.db.user.update({
    data: input,
    where: { id },
  })
}

export const deleteUser: MutationResolvers['deleteUser'] = ({ id }) => {
  return context.db.user.delete({
    where: { id },
  })
}

export const User: UserRelationResolvers = {
  posts: (_obj, { root }) => {
    return context.db.user.findUnique({ where: { id: root?.id } }).posts()
  },
  tenant: (_obj, { root }) => {
    return context.db.user.findUnique({ where: { id: root?.id } }).tenant()
  },
}
