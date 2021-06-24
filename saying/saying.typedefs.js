import { gql } from "apollo-server";

export default gql`
type Saying{
    id: Int!
    user: User!
    author:Author!
    createdAt:String!
    updateAt:String!
    tags: [Tag]
    text:String!
    totalLikes:Int!
    totalComments:Int!
    isMine: Boolean!
    isLike: Boolean!
    rownum: Int
}
type Like{
    id:Int!
    saying: Saying!
    createdAt:String!
    updateAt:String!

}


`;