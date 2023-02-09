export const schema = gql`
  type User {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    username: String!
    posts: [Post!]!
    tenant: Tenant!
    tenantId: ID!
  }

  type Query {
    users: [User!]! @requireAuth
    user(id: ID!): User @requireAuth
  }

  input UpdateUserInput {
    username: String
  }

  type Mutation {
    updateUser(id: ID!, input: UpdateUserInput!): User! @requireAuth
    deleteUser(id: ID!): User! @requireAuth
  }
`
