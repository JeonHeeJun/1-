import client from "../../client"

export default{
    Query:{
        searchTag:(_,{keword,take,lastId})=>(
            client.tag.findMany({
                where:{
                    name:{
                        contains:keword
                    }
                },
                take,
                skip:lastId?1:0,
                ...(lastId && {cursor:{id:lastId}}),
                orderBy:{
                    sayings:{
                        count:"desc"
                    }
                }
            })
        )
    }
}