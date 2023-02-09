import type {
  QueryResolvers,
  MutationResolvers,
  TenantRelationResolvers,
} from 'types/graphql'

export const tenants: QueryResolvers['tenants'] = () => {
  return context.db.tenant.findMany()
}

export const tenant: QueryResolvers['tenant'] = ({ id }) => {
  return context.db.tenant.findUnique({
    where: { id },
  })
}

export const updateTenant: MutationResolvers['updateTenant'] = ({
  id,
  input,
}) => {
  return context.db.tenant.update({
    data: input,
    where: { id },
  })
}

export const deleteTenant: MutationResolvers['deleteTenant'] = ({ id }) => {
  return context.db.tenant.delete({
    where: { id },
  })
}

export const Tenant: TenantRelationResolvers = {
  posts: (_obj, { root }) => {
    return context.db.tenant.findUnique({ where: { id: root?.id } }).posts()
  },
  users: (_obj, { root }) => {
    return context.db.tenant.findUnique({ where: { id: root?.id } }).users()
  },
}
