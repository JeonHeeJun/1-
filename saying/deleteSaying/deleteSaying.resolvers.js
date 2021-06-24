import client from "../../client";
import { protextResolver } from "../../users/users.utils";

export default{
    Mutation:{
        deleteSaying:protextResolver(
            async(_,{id},{loggedUser})=>{
                //삭제하려는 Saying 정보 가져오기.
                const saying = await client.saying.findUnique({
                    where:{id},
                    select:{
                        userId: true,
                    }
                })

                if(!saying){//Saying이 없는경우.
                    return{
                        ok:false,
                        error:"saying not found"
                    }
                }
                else if(saying.userId !== loggedUser.id){
                    //Mutation을 요청한 사용자가 Saying을 업로드한 사용자가 맞는지 확인.
                    //아닌경우 실패 메시지 반환.
                    return{
                        ok:false,
                        error:"you are not Saying Owner"
                    }
                }
                else{
                    //맞는경우, Saying과 관계가 있는 모든 Like, Comment 삭제 후
                    //Saying 삭제
                    await client.like.deleteMany({
                        where:{
                            sayingId:id
                        }
                    })
                    await client.comment.deleteMany({
                        where:{
                            sayingId:id
                        }
                    })
                    await client.saying.delete({
                        where:{
                            id    
                        }
                    })
                    return{
                        ok:true,
                    }
                }

            }
        )
    }
}