import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import client from "../../client"
import { scheduleManage, triggers } from "../../schedule";

export default {Mutation :{
 
    login:async(_,{email, password}) =>{
        //find user email
        const user = await client.user.findFirst({where:{email}});
        if(!user){
            return{
                ok:false,
                error:"User not found"
            }
        }
        if(user.isLogin){
            //isLogin 필드는 해당 User가 현재 다른곳에 로그인됐는지를 표시함.
            //추천 스케쥴 관리가 꼬이는것을 방지하기 위해 추가된 필드.
            //다른곳에서 로그인 됐다면 로그인 실패메시지 반환.
            return{
                ok:false,
                error:"Someone is login"
            }
        }
        
        //전달받은 password와 해당 user의 password 비교.
        const passwordOk = await bcrypt.compare(password, user.password)
        
        if(!passwordOk){
            //password가 다르다면 실패메시지반환.
            return {
                ok:false,
                error:"Incorrect password"
            }
        }

        //user.id를 포함시켜 access token을 만듬.
        const token = await jwt.sign({id:user.id},process.env.SECRET_KEY)
        //해당 user의 isLogin을 true로 update
        const info = await client.user.update({
            where:{
                email
            },
            data:{
                isLogin:true
            }
        })
        
        if(info.id){
            //update가 잘 되었다면, 해당 User의 추천 스케쥴을 triggers에 추가.
            const job = await scheduleManage({id:info.id , time: info.alarm}) 
            triggers.push({userId:info.id, job:job})
            
            return {
                ok:true,
                token:token
            }
        }
        else{
            console.log(`LOGIN  ERROR : info is ${info}. update user not exsist`)
        }
        

        //find user password
        //if ok return token
        

    }
}
}