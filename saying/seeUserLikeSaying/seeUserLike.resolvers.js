import client from "../../client"

export default {
    Query:{
        /*userId를 가진 User가 Like를 누른 글 반환
        lastId 다음 부터 take개의 결과를 받음.
        */
        seeUserLike:async(_,{userId, take, lastId})=>{
            //User와 관련된 Like를 lastId 다음부터 take개 가져옴 
           const userLikes = await client.user.findUnique({
                where:{id:userId}
            }).likes({
                take,
                skip:lastId?1:0,
                ...(lastId && {cursor :{id:lastId}}),
            })
            //userLikes에서 sayingId 정보들을 객체 형식으로 mapping
            const cond = userLikes.map(({sayingId})=>({
                    id:sayingId
            }))
            
            //id가 cond에 속하는 모든 Saying을 반환
            return client.saying.findMany({
                where:{
                    OR:cond
                }
            })
        }
    }
}