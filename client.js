import {PrismaClient} from '@prisma/client'
//DB와 소통 가능한 prismaClient 객체 생성.
const client = new PrismaClient()

export default client;