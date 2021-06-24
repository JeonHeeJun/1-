import client from "../../client";

export default async({id})=>{
    /*명언 추천 로직:
    1) User가 Like를 한 Saying의 Tag, 작성한 Saying의 Tag, 관심있어하는 Tag를 모두 모아서
    Tag별로 가중치를 매김
    */
    //최신 좋아요 누른 글 500개에서 모든 종류의 태그를 가져옴 : 가중치 1
    const fromlike = await client.$queryRaw(`
    select R."B" as id , count(R."B")
    from "_SayingToTag" as R,
    (select L."sayingId" as id
    from "Like" as L 
    where L."userId" = ${id}
    limit 500) as S
    where R."A" = S.id
    group by R."B"`);
    //user가 작성한 글 500개와 관련된 모든 태그를 가져옴 : 가중치 3
    const fromUser = await client.$queryRaw(`
    select R."B" as id, 3*count(R."B") as count
    from "_SayingToTag" as R,
    (select id
    from "Saying" as S
    where S."userId" = ${id}
    ) as S
    where R."A" = S.id
    group by R."B"
    limit 500`);
    //user가 관심있는 500개의 태그를 가져옴 : 가중치 5
    const fromTag = await client.$queryRaw(`
    select T."A" as id , 5*count(*) as count
    from "_TagToUser" as T
    where T."B" = 1
    group by(T."A")
    order by random()
    limit 500;`);


    const tagNum = 3;
    var num = -1;
    var choiceTag = []

    
    const makeJoin = (input)=>{
        var join = `(`;
        for(var i=0; i<input.length;i++){
            join = join + `${input[i]},`;
        }
        join = join.slice(0,-1)
        join = join + `)`;
        return join
    }
    const resultTag = [
        ...fromlike,
        ...fromUser,
        ...fromTag
    ]
    //User가 관심있는 Tag가 하나도 없다면 랜덤하게 하나 추천.
    if(resultTag.length === 0){
        return await client.$queryRaw(`
        select *
        from "Saying" as S
        order by random()
        limit 1
        `)
    }
    //tag들의 가중치 총합 계산.
    var sum = 0;
    for(var i =0; i<resultTag.length;i++){
        sum += resultTag[i].count
    }

    //2)Tag의 가중치를 고려해 랜덤하게 3개의 태그를뽑음.
    for(var i =0; i<tagNum;i++){
        //반복마다 가중치를 고려해 태그를 뽑고 choiceTag에 push
        choiceTag.push(resultTag[randomTag(resultTag,sum)].id);
        choiceTag = Array.from(new Set(choiceTag))

        //choiceTag의 모든 태그를 가지는 글의 개수를 검색
        num = await client.$queryRaw(`
        select count(*) as count
        from
        (select count(S.id) as count
        from "Saying" as S, "_SayingToTag" as R 
        where S."id" = R."A" and (R."B" in ${makeJoin(choiceTag)}) 
        group by S.id 
        having count(S.id) >=${choiceTag.length}) as T       
        `)
        console.log(num);
        
        //만약 글의 개수가 0개면 더이상 태그를 뽑지 않고, choiceTag의 마지막
        //Tag를 pop하고 2단계를 종료한다.
        if(num[0].count == 0) {
            choiceTag.pop();
            break;
        }
    }
    
    //3) choiceTag의 모든 Tag를 가진 Saying 을 검색한후, 
    //그 중 Like 순서로 가중치를 반영해 랜덤하게 하나의 명언을 추천
    const join = makeJoin(choiceTag);
    //console.log(`R."B" in `+join)
    const final = await client.$queryRaw(`with TEM as(
        select T.id, L.id as likeid
        from 
        (select S.id 
        from "Saying" as S, "_SayingToTag" as R 
        where S."id" = R."A" and (R."B" in ${join}) 
        group by S.id 
        having count(S.id) >=${choiceTag.length}) as T
        left join (select id,"sayingId" from "Like") as L
        on T.id = L."sayingId"),
        CTE as(
        select id, count(id)+1 as likenum
        from TEM
        where likeid is not null
        group by id
        union
        select id, 1 as likenum
        from TEM
        where likeid is null
        ),
        PER as (select C.id, C.likenum/S.sum as percent
        from CTE as C, (select sum(likenum) from CTE) as S)
        
        select S.*
        from "Saying" as S, PER as P
        where P.id = S.id
        order by random()*(1.0/P.percent)
        limit 1;`);

    return final;
}

const randomTag = (input,total)=>{
    //가중치를 고려해 랜덤하게 태그를 뽑는 함수.
    const random = Math.floor(((total+1) * Math.random()));
    var check = 0;
    for(var i =0; i<input.length;i++){
        check += input[i].count
        if(random <= check) return i;
    }
}