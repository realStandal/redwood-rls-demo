export const schema = gql`
  type Tenant {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
    posts: [Post!]!
    users: [User!]!
  }

  type Query {
    tenants: [Tenant!]! @requireAuth
    tenant(id: ID!): Tenant @requireAuth
  }

  input UpdateTenantInput {
    name: String
  }

  type Mutation {
    updateTenant(id: ID!, input: UpdateTenantInput!): Tenant! @requireAuth
    deleteTenant(id: ID!): Tenant! @requireAuth
  }
`
