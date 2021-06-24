import {gql} from 'apollo-server'

export default gql `
    type User{
        id:String!
        name:String!
        email:String!
        createdAt:String!
        updateAt:String!
        bio: String
        avatar: String
        sayings(take:Int!,lastId:Int): [Saying]
        tags:[Tag]
        totalSayings:Int
        totalLikes:Int
        totalRank:Int
    }

`;