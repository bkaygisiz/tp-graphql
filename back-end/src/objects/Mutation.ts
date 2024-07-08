import { arg, asNexusMethod, intArg, nonNull, objectType } from "nexus"
import { Context } from "../context"

export const Mutation = objectType({
    name: 'Mutation',
    definition(t) {
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
          console.log(post)
          console.log(args.postCreateInput.author?.name)
          await context.prisma.user.update({
            where: { email: args.postCreateInput.author?.email },
            data: {
              posts: {
                connect: { id: post.id }
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