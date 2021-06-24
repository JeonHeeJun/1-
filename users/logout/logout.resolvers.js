
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import client from "../../client"
import { triggers } from "../../schedule";
import { protextResolver } from "../users.utils";

export default {
    Mutation :{
    logout:protextResolver(async(_,temp,{loggedUser}) =>{
        try{
            //해당 User의 isLogin 수정.
            await client.user.update({
                    where:{
                        id:loggedUser.id
                    },
                    data:{
                        isLogin:false
                    }
                })
    
            for(var i = 0 ; i<triggers.length;i++){
                if(triggers[i].userId == loggedUser.id){
                    //triggers에서 해당 User의 스케쥴을 제거.
                    triggers[i].job.cancel()
                    triggers.splice(i,1)
                    console.log("after logout, trigger length: ",triggers.length)
                    break;
                }
            }   
            return {
                ok:true,
            }
        }
        catch(e){
            console.log("LOGOUT: ",e)
            return {
                ok:false,
                error:e
            }
        }
    })
}
}