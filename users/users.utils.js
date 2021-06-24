import client from "../client"
import jwt from "jsonwebtoken"


export const getUser = async(token) =>{
    try{
        //http header에 전달받은 token에서 id 정보 추출.
        
        const {id} = await jwt.verify(token, process.env.SECRET_KEY)
        const user = await client.user.findUnique({where:{id}});
        if(!token){ //token을 전달받지 못했다면 null 반환.
            return null;
        }
        if(user){//id에 해당하는 User가있다면 정보 반환.
            return user;
        }
        else{//없다면 null반환.
            return null;
        }
    }
    catch{
        return null;
    }
}

export const protextResolver = (ourResolver) =>(root,args,context,info)=>{
    
    /*사용자가 http 프로토콜 header에 access token을 보내지 않았다면
    resolvers 실행 불가. 
    
    ourResolvers : 사용자가 요청한 Query/Mutation의 resolvers
    */
    if(!context.loggedUser){//Query/Mutation 요청에서 context.loggedUser가 null을 반환하는지 검사.
        const query  = info.operation.operation === "query";
        if(query){//Query라면 null 반환.
            return null;
        }
        else{
        return {//Mutation 이라면 실패 메시지 반환.
            ok:false,
            error:"You need to log in."
        }
    }
    }
        //access token이 있다면 resolvers정상수행.
        return ourResolver(root,args,context,info);
}


