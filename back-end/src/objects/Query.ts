import { arg, asNexusMethod, enumType, inputObjectType, intArg, nonNull, objectType, stringArg, } from "nexus"
import { Context } from "../context"

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