require('dotenv').config()
import {ApolloServer} from 'apollo-server-express'
import {typeDefs, resolvers} from './schema'
import { getUser, protextResolver } from './users/users.utils';
import express from "express"
import logger from "morgan"
import {triggers,initTriggers} from './schedule'


 //schema.js에서 합친 typedefs, resolvers를 이용해 Query/Mutation 생성
const apollo = new ApolloServer({ //schema.js에서 합친 typedefs, resolvers를 이용해 Query/Mutation 생성
    typeDefs,
    resolvers,
    context:async({req})=>{
        /*모든 Query/Muation에서 공통적으로 접근가능한 변수 정의.
        loggedUser : 현재 서버에 Query/Mutation을 보낸 로그인 된 사용자의 정보.
        */
        return {
            loggedUser: await getUser(req.headers.authorization), 
            protextResolver
        }
    }
}); 


initTriggers()//초기 푸쉬알림 트리거 실행.

const PORT = process.env.PORT;
const app = express()//서버에 이미지를 업로드할때 사용. 현재 구현된 앱에서는 사용하지 않는다.
app.use(logger("tiny"))//서버 로그 기록, 출력
apollo.applyMiddleware({app})//서버에 이미지를 업로드할때 사용. 현재 구현된 앱에서는 사용하지 않는다.
app.use("/static",express.static("uploads"))
app.listen({port: PORT},() =>{//해당 주소:PORT 로 서버 실행
    console.log(`http://localhost:${PORT}/graphql`);
});

