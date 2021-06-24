import client from "../../client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { protextResolver } from "../users.utils";
import { createWriteStream }from "fs"
import {triggers,scheduleManage} from "../../schedule"
export default{
    Mutation :{
        editProfile: protextResolver(//Tag가 있다면 disconnect하고 새로운 Tag추가.
            async(_,
                {name,email,password:newPassword,bio,avatar,tags,time},
                {loggedUser}
                )=>{
                    //alarm은 "시,분" String
                    //test단계에선 편의상 0초마다하는걸로 가정.
                let avatarUrl = null;
                if(avatar){
                const {filename, createReadStream} = await avatar;
                const newFileName = `${loggedUser.id}-${Date.now()}-${filename}`
                const readStream = createReadStream()
                const writeStream = createWriteStream(process.cwd() +"/uploads/"+ newFileName)
                //console.log(process.cwd()+newFileName)
                readStream.pipe(writeStream);
                avatarUrl = `http://localhost:4000/static/${newFileName}`
                }

                let uglyPassword = null;
                if(newPassword){
                    uglyPassword = await bcrypt.hash(newPassword,10)
                }
                
                let newtag = null;
                if(tags){
                    const oldtags = await client.user.findUnique({
                        where:{
                            id:loggedUser.id
                        },
                        select:{
                            tags:{
                                select:{
                                    name:true
                                }
                            }
                        }
                    })
                    console.log(oldtags);
                    await client.user.update({
                        where:{
                            id:loggedUser.id
                        },
                        data:{
                            tags:{
                                disconnect:oldtags.tags,
                            }
                        }
                    })
                newtag = tags.map((name)=>({
                        name:name
                    }))
                }
                if(time){
                    //trigger에서 기존 스케쥴 갱신.
                    //test : n 분 0 초마다 sid 갱신
                    console.log(triggers)
                    for(var i = 0;i<triggers.length;i++){
                        if(triggers[i].userId === loggedUser.id){
                            
                            const alarm = time.split(',')
                            triggers[i].job.reschedule(`${alarm[0]} * * * * *`)
    
                            break;
                        }
                    }
                    //const job = schedule.scheduleJob('0 * * * * *', async (firedata) => {
                        

                    //})
                }
                const updatedUser = await client.user.update(
                {where:{
                    id: loggedUser.id
                },data:{
                    name,
                    email,
                    bio,
                    ...(uglyPassword && {password: uglyPassword}),
                    ...(avatarUrl && {avatar: avatarUrl}),
                    ...(newtag && {tags:{connect:newtag}}),
                    alarm:time
                }})
                if(updatedUser.id){
                    return{
                        ok:true
                    }
                }
                else{
                    return{
                        ok:false,
                        error:"could not update profile"
                    }
                }
            }
        )
    }
}