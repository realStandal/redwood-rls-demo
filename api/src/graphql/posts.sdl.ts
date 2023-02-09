export const schema = gql`
  type Post {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    title: String!
    body: String!
    user: User!
    userId: ID!
    tenant: Tenant!
    tenantId: ID!
  }

  type Query {
    posts: [Post!]! @requireAuth
    post(id: ID!): Post @requireAuth
  }

  input CreatePostInput {
    title: String!
    body: String!
  }

  input UpdatePostInput {
    title: String
    body: String
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post! @requireAuth
    updatePost(id: ID!, input: UpdatePostInput!): Post! @requireAuth
    deletePost(id: ID!): Post! @requireAuth
  }
`
