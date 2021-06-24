
import bcrypt from "bcrypt"
import client from "../../client"
//import {triggers,scheduleManage} from "../../schedule"
export default {
    Mutation :{
        createAccount:async(_,{
            name,
            email,
            password,
        }) =>{
            //user name, email unique check
            try{
            const existingUser = await client.user.findFirst({
                where:{
                    OR:[{
                        name,
                    },
                    {
                        email,
                    }
                    ]
                }
            })
            if(existingUser){
                throw new Error("this username/password is already taken.")
            }
            const existingAuthor = await client.author.findFirst({
                where:{
                    name
                }
            })
            if(existingAuthor){
                throw new Error("this username is already taken by author name.")
            }
            const uglyPassword = await bcrypt.hash(password,10)
            const newUser = await client.user.create({data:{
                name, email, password:uglyPassword
            }})
            //recommand
            const initSay = await client.$queryRaw(`
                select *
                from "Saying" as S
                order by random()
                limit 1
                `)
            await client.recomand.create({data:{
                saying:{
                    connect:{
                        id:initSay[0].id
                    }
                },
                user:{
                    connect:{
                        id:newUser.id
                    }
                }
            }})

            // 00:00 에 추천쿼리 변경
            //const job = await scheduleManage({id:newUser.id,time:"0,0"})
            //triggers.push({userId:newUser.id, job:job})

            //password hash create
            //save and return

            return {
                ok:true,
            };
            }
            catch(e){
                console.log(e)
                return {
                    ok:false,
                    error:"Can't create account"
                }
            }

        }
    }
    
}