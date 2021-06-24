import {gql} from 'apollo-server'

export default gql `

type Mutation {
        registerToken(id:Int!,token:String!) : MutationResponse
}

`;