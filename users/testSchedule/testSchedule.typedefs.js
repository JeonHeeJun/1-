import {gql} from 'apollo-server'

export default gql `
    type Query{
        test(id:Int!): User
    }

`;