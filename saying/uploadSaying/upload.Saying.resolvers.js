import client from "../../client";
import { protextResolver } from "../../users/users.utils";

export default {
    Mutation:{
        uploadSaying:protextResolver(async(_,{text,tag,author},{loggedUser})=>{
            //전달받은 tag들을 객체로 표현.
            const tagObj = tag.map((name)=>({
                where:{name},
                create:{name}
            }))
            
            try{
            //전달받은 text, tag, author, user을 이용해 Saying을 만듬.
            const what = await client.saying.create({
                data:{
                    text,
                    user:{
                        connect:{//id로 loggedUser.id를 갖는 User와 관계 형성. 
                            id:loggedUser.id,
                        }
                    },
                    author:{
                        connectOrCreate:{//해당 name의 Author가 있다면 새로 만들어지는 Saying과 관계 형성, 없다면 
                                        //Author을 새로만들고 관계형성.
                          where:{name:author},
                          create:{name:author}  
                        }
                    },
                    tags:{
                        connectOrCreate: tagObj,
                        //해당 tag가 있다면 새로 만들어지는 Saying과 관계 형성, 없다면 
                        //Author을 새로만들고 관계형성.
                    },
                    
                }
            })
            //console.log(what);
            return what;
            }
            catch(e){
                //에러 처리
                console.log(e)
                return {
                    ok:false,
                    error:"create failed"
                }
            }
        
        })
    }
}