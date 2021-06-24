import client from "../client";

export default{
    User:{
        sayings:({id},{take,lastId})=>(
        client.user.findUnique({
            where:{id}
        }).sayings({
            take,
            skip:lastId?1:0,
            ...(lastId && {cursor:{id:lastId}})
        })//나중에 search식으로 수정필요.
    ),
    totalLikes:({id})=>(client.like.count({
        where:{
            userId:id 
        }
    })),
    totalSayings:({id})=>(client.saying.count({
        where:{
            userId:id
        }
    })),
    totalRank:async ({id})=>{
        //유저가 올린 명언들의 좋아요 수 총합.
        console.log("id: ",id)
        const total =await client.$queryRaw(`
        select count(*)
        from "Like" as L
        where L."sayingId" in (
        select id
        from "Saying" as S
        where S."userId" = ${id}
        )`)
        return(total[0].count)
    }
}
}