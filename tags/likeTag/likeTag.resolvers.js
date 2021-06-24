import client from "../../client";
import { protextResolver } from "../../users/users.utils";

export default{
    Mutation:{
        likeTag:protextResolver(async(_,{id},{loggedUser})=>{
            /* User가 관심있는 Tag와 관계 형성  */
            const tag = await client.tag.findUnique({
                //해당 id의 Tag가 있는지 검사.
                where:{
                    id
                }
            });
            if(!tag){
                //없다면 실패메시지 반환.
                return{
                    ok: false,
                    error: "saying not found",
                }
            }
            //있다면 User와 해당 tag 관계 형성.
           await client.user.update({
                
                where:{id:loggedUser.id},
                data:{
                    tags:{
                        connect:{
                            id:tag.id
                        }
                    }
                }
            
            })
            return {
                ok:true,
            }
        })
    }
}