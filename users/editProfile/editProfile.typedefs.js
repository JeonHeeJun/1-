import {gql} from "apollo-server"
export default gql`
type Mutation {
    editProfile(
            name:String
            email:String
            password:String
            bio:String
            avatar:Upload
            tags:[String]
            time:String
        ):MutationResponse
}
`;