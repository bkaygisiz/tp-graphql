import { arg, asNexusMethod, enumType, inputObjectType, intArg, nonNull, objectType, stringArg, } from "nexus"
import { Context } from "./context"

import { DateTimeResolver } from 'graphql-scalars'
import { EmailAddress } from "graphql-scalars/typings/mocks"
export const DateTime = asNexusMethod(DateTimeResolver, 'date')
export const Query = objectType({
    name: 'Query',
    definition(t) {
      t.nonNull.list.nonNull.field('allUsers', {
        type: 'User',
        resolve: (_parent, _args, context: Context) => {
          return context.prisma.user.findMany()
        },
      })
  
      t.nullable.field('userByEmail', {
        type: 'User',
        args: {
          email: stringArg(),
        },
        resolve: (_parent, args, context: Context) => {
          return context.prisma.user.findUnique({
            where: { email: args.email || undefined }
          })
        },
      })

      t.nullable.field('postById', {
        type: 'Post',
        args: {
          id: intArg(),
        },
        resolve: (_parent, args, context: Context) => {
          return context.prisma.post.findUnique({
            where: { id: args.id || undefined },
          })
        },
      })
  
      t.nonNull.list.nonNull.field('feed', {
        type: 'Post',
        resolve: (_parent, args, context: Context) => {
          return context.prisma.post.findMany({})
        },
      })
    },
  })
  
 export const Mutation = objectType({
    name: 'Mutation',
    definition(t) {
      t.nonNull.field('signupUser', {
        type: 'User',
        args: {
          data: nonNull(
            arg({
              type: 'UserCreateInput',
            }),
          ),
        },
        resolve: (_, args, context: Context) => {
          const postData = args.data.posts?.map((post) => {
            return { title: post.title, content: post.content || undefined }
          })
          return context.prisma.user.create({
            data: {
              name: args.data.name,
              email: args.data.email,
              posts: {
                create: postData,
              },
            },
          })
        },
      })
  
      t.field('togglePublishPost', {
        type: 'Post',
        args: {
          id: nonNull(intArg()),
        },
        resolve: async (_, args, context: Context) => {
          try {
            const post = await context.prisma.post.findUnique({
              where: { id: args.id || undefined },
              select: {
                published: true,
              },
            })
            return context.prisma.post.update({
              where: { id: args.id || undefined },
              data: { published: !post?.published },
            })
          } catch (e) {
            throw new Error(
              `Post with ID ${args.id} does not exist in the database.`,
            )
          }
        },
      })

      t.field('createPost', {
        type: 'Post',
        args: {
          postCreateInput: nonNull(
            arg({
              type: 'PostCreateInput'
            })
          )
        },
        resolve: async (_, args, context: Context) => {
          const post = await context.prisma.post.create({
            data: {
              title: args.postCreateInput.title,
              content: args.postCreateInput.content
            }
          })
          await context.prisma.user.update({
            where: { email: args.postCreateInput.author },
            data: {
              posts: {
                connect: { id: post.id}
              }
            }
          })
          return post
        }
      })
  
      t.field('deletePost', {
        type: 'Post',
        args: {
          id: nonNull(intArg()),
        },
        resolve: (_, args, context: Context) => {
          return context.prisma.post.delete({
            where: { id: args.id },
          })
        },
      })
    },
  })

export const User = objectType({
    name: 'User',
    definition(t) {
      t.nonNull.int('id')
      t.string('name')
      t.nonNull.string('email')
      t.nonNull.list.nonNull.field('posts', {
        type: 'Post',
        resolve: (parent, _, context: Context) => {
          return context.prisma.user
            .findUnique({
              where: { id: parent.id || undefined },
            })
            .posts()
        },
      })
    },
})

export const Post = objectType({
    name: 'Post',
    definition(t) {
      t.nonNull.int('id')
      t.nonNull.field('createdAt', { type: 'DateTime' })
      t.nonNull.field('updatedAt', { type: 'DateTime' })
      t.nonNull.string('title')
      t.string('content')
      t.nonNull.boolean('published')
      t.nonNull.int('viewCount')
      t.field('author', {
        type: 'User',
        resolve: (parent, _, context: Context) => {
          return context.prisma.post
            .findUnique({
              where: { id: parent.id || undefined },
            })
            .author()
        },
      })
    },
  })
  
  export const SortOrder = enumType({
    name: 'SortOrder',
    members: ['asc', 'desc'],
  })
  
  export const PostOrderByUpdatedAtInput = inputObjectType({
    name: 'PostOrderByUpdatedAtInput',
    definition(t) {
      t.nonNull.field('updatedAt', { type: 'SortOrder' })
    },
  })
  
  export const UserUniqueInput = inputObjectType({
    name: 'UserUniqueInput',
    definition(t) {
      t.int('id')
      t.string('email')
    },
  })
  
  export const PostCreateInput = inputObjectType({
    name: 'PostCreateInput',
    definition(t) {
      t.nonNull.string('title')
      t.string('content')
      t.nonNull.string('author')
    },
  })
  
  export const UserCreateInput = inputObjectType({
    name: 'UserCreateInput',
    definition(t) {
      t.nonNull.string('email')
      t.string('name')
      t.list.nonNull.field('posts', { type: 'PostCreateInput' })
    },
  })
