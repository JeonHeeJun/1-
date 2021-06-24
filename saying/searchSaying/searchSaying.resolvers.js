import client from "../../client";

export default{
    Query:{ //left join 필요
        searchSaying:async(_,{keyword,take,lastId})=>{
            let baseQuery = ` with tem as (
                select (row_number() over() ) as rownum , T.*
                from (select T.id
                from(select *
                from "Saying" as S
                where S.text like '%${keyword}%') as T
                left join 
                "Like" as L
                on L."sayingId" = T.id 
                group by T.id
                order by count(L.id) desc) as T)`

            let offsetRow = 0; 
            if(lastId){
                 const rowNum = await client.$queryRaw(
                    baseQuery +
                     `
                    select rownum
                    from tem
                    where tem.id = ${lastId}
                `)
                //console.log(rowNum)
                if(rowNum.length !== 0)
                    offsetRow = rowNum[0].rownum
                    
                //console.log("offsetRow",offsetRow)
            }
   

                const result = await client.$queryRaw(
                   baseQuery +  `
                 select S.*,C.rownum
                 from "Saying" as S, (select *
                 from tem
                 limit ${take}
                 offset ${offsetRow}) as C
                 where S.id = C.id
                `)
                return result;
                
            

        }
    }
}