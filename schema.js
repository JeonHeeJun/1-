import {loadFilesSync,mergeTypeDefs,makeExecutableSchema,mergeResolvers, loadTypedefs} from "graphql-tools"
//정의한 모든 typedefs, resolvers 파일의 내용들을 하나로 합치기.
const loadedTypes = loadFilesSync(`${__dirname}/**/*.typedefs.js`)
const loadedResolvers = loadFilesSync(`${__dirname}/**/*.resolvers.js`)

export const typeDefs = mergeTypeDefs(loadedTypes)
export const resolvers = mergeResolvers(loadedResolvers)
