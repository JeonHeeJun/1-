import client from "../../client";
import { protextResolver } from "../users.utils";

export default {
    Query:{
        seeFeed:protextResolver((_,temp,{loggedUser})=>
           client.recomand.findUnique({
                where:{
                    userId : loggedUser.id
                },
                select:{
                    saying:true
                }
            }).saying()
        )
    }
}
