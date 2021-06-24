import client from "../../client";
import { triggers } from "../../schedule";
import { protextResolver } from "../users.utils";

export default{
    Mutation:{
    deleteAccount: protextResolver(async(_,{id},{loggedUser})=>{
        const user = await client.user.findUnique({
            where:{id}
        })
        //console.log(saying)
        if(!user){
            return{
                ok:false,
                error:"user not found"
            }
        }
        else if(user.id !== loggedUser.id){
            return{
                ok:false,
                error:"you are not that User"
            }
        }
        else{
                try{
                    await client.like.deleteMany({
                        where:{
                            userId:id
                        }
                    })
                    await client.$executeRaw(`
                    update "Comment"
                    set "userId" = 2
                    where "userId" = ${id}
                    `)
                    await  client.$executeRaw(`
                    update "Saying"
                    set "userId" = 2
                    where "userId" = ${id}
                    `)
                    await client.recomand.delete({
                        where:{
                            userId:id
                        }
                    })

                    await client.user.delete({
                        where:{id}
                    })
                    
                    for(var i = 0 ; i<triggers.length;i++){
                        if(triggers[i].userId == id){
                            triggers[i].job.cancel()
                            triggers.splice(i,1)
                            console.log("after deleteAccount, trigger length: ",triggers.length)
                            break;
                        }
                    }
                    return{
                        ok:true,
                    }
            }
                catch(e){
                    return {
                        ok: false,
                        error : e
                    }
                }
            
        }


    })
    }
}