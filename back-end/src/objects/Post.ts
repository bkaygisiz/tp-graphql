import { asNexusMethod, inputObjectType, objectType, } from "nexus"
import { Context } from "../context"

import { DateTimeResolver } from 'graphql-scalars'
export const DateTime = asNexusMethod(DateTimeResolver, 'date')
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

export const PostCreateInput = inputObjectType({
    name: 'PostCreateInput',
    definition(t) {
        t.nonNull.string('title')
        t.string('content')
        t.nonNull.field('author', { type: 'UserBasicInput' })
    },
})