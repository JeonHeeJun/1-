import client from "../../client";

export default {
    Query:{/*name필드에 keyword를 포함한 Author 검색
        lastId 다음 take 수만큼 결과를 가져온다.
        */
        searchAuthor:(_,{keyword, take,lastId})=>client.author.findMany({
            take,//take개의 결과 받기.
            skip:lastId? 1:0, //lastId 값을 전달받았다면, lastId 결과는 하나 skip하고 다음 id 부터 반환.
            ...(lastId && {cursor :{id:lastId}}),
             //lastId로 값 전달받았면, 기본적으로 lastId 부터 결과 반환
            where:{//keyword에 해당하는 author 검색
                name:{
                    contains:keyword
                }
            },
            orderBy:{//관련된 명언 수가 많은 순서로 Author 결과 sorting
                sayings:{
                    count:"desc"
                }
            }
        })
    }
}