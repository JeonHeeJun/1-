import parse from"csv-parse/lib/sync"
import { FORMERR } from "dns"
import fs from "fs"
import client from "../client"
export default {
    Mutation:{
        addCSV:async(_,{fileName})=>{
            //protect 및 파일크기 limit 코드 필요할지도??: 필요없음. 명언이 13000개되도 1MB도 안됨
            //txt로 집어넣어야함. csv로 넣을수있도록 로직변경가능.
            const csv = fs.readFileSync(process.cwd()+`/init/${fileName}`)
            //console.log(csv.toString())
            const record = parse(csv.toString())
            record.splice(0,1)
            console.log(record)
            //user, text, tag
            var allAuthor = []
            var allTag = []
            for(var i =0; i<record.length;i++){
                //console.log(i)
                allAuthor.push(record[i][0])
                //console.log(record[i][2])
                const temp= JSON.parse(record[i][2].replaceAll('\'','\"'))
                for(var j=0; j<temp.length;j++){
                    allTag.push(temp[j])
                }
            }
            allAuthor = Array.from(new Set(allAuthor))
            allTag = Array.from(new Set(allTag))
            console.log(allAuthor)
            console.log(allTag)
            
            const exsistAuthor = await client.author.findMany({
                where:{
                    name:{
                        in:allAuthor
                    }
                }
            })
            //있는목록과 없는목록을 합쳐 id를 만듬.
            const lastAuthor = await client.author.findFirst({
                orderBy:{
                    id:'desc'
                },
                take:1,
                select:{
                    id:true
                }
            })
            //console.log(lastAuthor)
            var AuthorId = 1;
            if(lastAuthor !== null)
               AuthorId = lastAuthor.id + 1;
            console.log(AuthorId);
            console.log(exsistAuthor);
            var allAuthorId = []
            var pushAuthor = []
            for(var i = 0; i<allAuthor.length;i++){
                const check = 0;
                for(var j =0; j<exsistAuthor.length;j++){
                    //console.log(exsistAuthor[j].name, allAuthor[i])
                    if(exsistAuthor[j].name === allAuthor[i]){
                        allAuthorId.push(exsistAuthor[j].id)
                        check = 1;
                        break;
                    }
                }
                if(check===0){
                   // console.log(check);
                    allAuthorId.push(AuthorId)
                    AuthorId ++;
                    pushAuthor.push(allAuthor[i])
                }
            }
            console.log(pushAuthor)
            console.log(allAuthorId)
            
            const exsistTag =await client.tag.findMany({
                where:{
                    name:{
                        in:allTag
                    }
                }
            })
            const lastTag = await client.tag.findFirst({
                orderBy:{
                    id:'desc'
                },
                take:1,
                select:{
                    id:true
                }
            })
            var tagId = 1;
            if(lastTag !== null)
               tagId = lastTag.id + 1;
            //console.log(exsistTag)
            console.log("tag??",tagId)
            var allTagId = []
            var pushTag = []
            for(var i = 0; i<allTag.length;i++){
                const check = 0;
                for(var j =0; j<exsistTag.length;j++){
                    //console.log(exsistTag[j].name, allTag[i])
                    if(exsistTag[j].name === allTag[i]){
                        allTagId.push(exsistTag[j].id)
                        check = 1;
                        break;
                    }
                }
                if(check===0){
                    //console.log(check);
                    allTagId.push(tagId)
                    tagId ++;
                    pushTag.push(allTag[i])
                }
            }
            console.log(pushTag)
            console.log(allTagId)
            var makeValues = ``;
            const lastSaying = await client.saying.findFirst({
                orderBy:{
                    id:"desc"
                },
                take:1,
                select:{
                    id:true
                }
            })
            
            var sayingId = 1;
            if(lastSaying !== null)
                sayingId = lastSaying.id + 1;
            console.log(sayingId);
            for ( var i =0; i<record.length;i++){
                const temp = JSON.parse(record[i][2].replaceAll('\'','\"'))
                for(var j=0; j< temp.length;j++){
                    makeValues = makeValues + `(${sayingId+i},${allTagId[allTag.indexOf(temp[j])]}),`
                }
            }
            makeValues=makeValues.slice(0,-1)
            console.log(makeValues);
            //tag와 saying관계
            
        try{
            //여기서 pushAuthor, pushTag createMany로 집어넣기
            const checkInit= await client.user.findUnique({
                where:{
                    name:"명언"
                }
            })
            console.log(checkInit);
            if(checkInit===null){
                await client.user.createMany({
                    data:[
                        {name:"명언"},
                        {name:"(알수없음)"}
                    ]
                })
            }
           
            await client.author.createMany({
                data: pushAuthor.map((row)=>({name:row}))
            });
            await client.tag.createMany({
                data: pushTag.map((row)=>({name:row}))
            })
            await client.saying.createMany({
                data: record.map((row)=>({
                    userId:1,
                    authorId:allAuthorId[allAuthor.indexOf(row[0])],
                    text: row[1]
                }))
            })
            
            await client.$executeRaw(`
            insert into "_SayingToTag"
            ("A","B")
            Values
            ${makeValues}
            `)
            
            return{
                ok:true,
            }
         }
         catch(e){
             console.log(e)
             return{
                 ok:false,
                 error: e
             }
         }
        }
    }
}
