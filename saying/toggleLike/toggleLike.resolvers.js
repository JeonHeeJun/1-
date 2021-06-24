import client from "../../client";
import { protextResolver } from "../../users/users.utils";

export default{
    Mutation:{
        toggleLike:protextResolver(async(_,{id},{loggedUser})=>{
            const saying = await client.saying.findUnique({
                //id에 해당하는 Saying이 있는지 검사.
                where:{
                    id
                }
            });
            if(!saying){
                //없다면 실패메시지 반환.
                return{
                    ok: false,
                    error: "saying not found",
                }
            }
            const likeWhere = {
                //Like를 삭제해야 하는 경우 이용. Like 정보가 담긴 객체.
                sayingId_userId:{
                    userId: loggedUser.id,
                    sayingId:id,
                }
            }
            const like = await client.like.findUnique({
                //User가 해당 Saying에 Like를 이미 눌렀는지 확인.
                where: likeWhere
            })
            if(like){
                //이미 눌렀다면 해당 Like 삭제.
                await client.like.delete({
                    where:likeWhere
                })
            } else{
                //누르지 않았다면 Like 데이터 생성.
                await client.like.create({
                    data:{
                        user:{
                            connect:{
                                id:loggedUser.id
                            }
                        },
                        saying:{
                            connect:{
                                id:saying.id
                            }

                        }
                    }
                })
            }
            return {
                ok:true
            }
        })
    }
}