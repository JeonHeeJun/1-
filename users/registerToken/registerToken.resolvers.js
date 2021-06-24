import client from "../../client"

export default {
    Mutation:{
        registerToken: async(_,{id,token})=>{
        try{
        const result= await client.user.update({
            where:{
                id
            },
            data:{
                token
            }
        })
        return {
            ok:true,
        }
        }
        catch(e){
            return {
                ok:false,
                error:e
            }
        }
    }
    }
}