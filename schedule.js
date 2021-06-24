import * as schedule from "node-schedule"
import * as seeFeed from "./users/seeFeed/seeFeedLogic"
import client from "./client";
export var triggers = [];
import {Expo} from 'expo-server-sdk'

//triggers에 스케쥴 추가
export const scheduleManage = async ({id,time}) =>{
    // time: "시,분" 
    // 추천 스케쥴을 만드는 함수.

    //"시,분" String을 [시,분]으로 변환.
    const alarm = time.split(',')

    const job = schedule.scheduleJob({hour:alarm[0], minute:alarm[1]}, async (fireDate)=>{

        //추천 알고리즘으로 User가 관심있을법한 명언 추천.
        const result = await seeFeed.default({id})

        console.log(`at fireData : ${fireDate}, trigger : ${id}, newSayingId : ${result[0].id}`)

        //User에 대응되는 recommand 데이터 가져옴.
        const {sayingId} = await client.recomand.findUnique({where:{
            userId:id
        }})

        //recommand의 Sayingid가 null이 아니라면 
        //과거 추천명언과 recommand의 관계를 지움.
        if(sayingId){
            await client.recomand.update({
                where:{
                    userId:id
                },
                data:{
                    saying:{
                        disconnect:true
                    }
                }
            })
        }
        //현재 추천명언과 recommand의 관계 형성
        await client.recomand.update({
            where:{
                userId:id
            },
            data:{
                saying:{
                    connect:{
                        id:result[0].id
                    }
                }
            }
        })
        
        //사용자 기기에 푸시알림 전송.
        await pushNotification({id,result});
        
    })

    return job
    //triggers.push({userId:id ,job:job})
}


export const initTriggers = async () =>{

    //서버재시작시  전체유저중 로그인 상태(isLogin)인 User만
    //추천 스케쥴 관리
    try{
        const userList = await client.user.findMany({
            where:{
                isLogin:true
            },
            select:{
                id:true,
                alarm:true
            }
        })
        
        for(var i = 0 ; i<userList.length; i++){
            //0,1 id :  명언, (알수없음)
            const job = await scheduleManage({id:userList[i].id,time:userList[i].alarm});
            triggers.push({userId:userList[i].id, job:job})
        }
        console.log("after initTriggers, trigger length: ",triggers.length)
        }
    catch(e){
        console.log(`INIT TRIGGERS : ${e}`)
    }
}  
//계정탈퇴 : trigger에서 엔트리 지우기

 const pushNotification = async ({id,result}) =>{
     //푸쉬알림 보내는 함수.
    const {token} = await client.user.findUnique({
         where:{
             id
         },
         select:{
             token:true
         }
     })
     //User필드에 token에 push token이 있는지 확인.
     if(token){ 
        //있다면 푸시 알림 보내기.
        // 명언 내용, 저자 데이터가 푸시알림으로 사용자 기기에 전달된다.
        const {name} = await client.author.findUnique({
            where:{
                id:result[0].authorId
            },
            select:{
                name:true
            }
        })

        if(!Expo.isExpoPushToken(token)){
            //token이 유효한 expo push token 인지 검사.
            console.error(`push tken ${token} is not valid`)
        }
        else{

            let expo = new Expo();
            let msg = []
            
            //푸시알림에 적을 명언 text, 저자 명 구성.
            msg.push({ 
                to: token,
                sound: 'default',
                title: result[0].text,
                body : name,
                data: result[0]

            })

            //메시지를 expo서버에 보내고, 보낸 결과를 tickets에 저장.
            //tickets은 expo 서버에 잘 전달 됐는지, 전달 에러가 발생했는지 등의
            //정보를 포함하고있음.
            //expo 서버는 전달된 메시지를 푸시알림 형태로 실제 기기에 전송.
            let chunks = expo.chunkPushNotifications(msg);
            let tickets = []
            for (let chunk of chunks){
                try{
                    console.log("chunk:",chunk)
                    let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
                    tickets.push(...ticketChunk)
                }
                catch(error){
                    console.error(error);
                }
            }

            //위에서 받은 ticket을 가지고, 푸시알림이 제대로 기기에 도착했는지 expo서버에 물어볼 수 있음.
            //expo 서버는 잘 도착했다면 status : ok 반환, 아니면 error 반환.
            let receiptIds = [];
            for (let ticket of tickets) {
                // NOTE: Not all tickets have IDs; for example, tickets for notifications
                // that could not be enqueued will have error information and no receipt ID.
                if (ticket.id) {
                    receiptIds.push(ticket.id);
                }
            } 
            let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
            for (let chunk of receiptIdChunks){
                try{
                    //expo 서버에게 푸시 알림이 사용자 기기에 잘 도착했는지 확인.
                    //결과 receipts에 저장.
                    let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                    console.log("receipts: ",receipts);
            
                    // The receipts specify whether Apple or Google successfully received the
                    // notification and information about an error, if one occurred.
                    for (let receiptId in receipts) {
                        
                    let { status, message, details } = receipts[receiptId];
                    if (status === 'ok') {
                        continue;
                    } else if (status === 'error') {
                        console.error(
                        `There was an error sending a notification: ${message}`
                        );
                        if (details && details.error) {
        
                        // The error codes are listed in the Expo documentation:
                        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                        // You must handle the errors appropriately.
                        console.error(`The error code is ${details.error}`);
                        if(details.error === 'DeviceNotRegistered'){
                            //'DeviceNotRegistered' : 사용자가 앱을 지운경우 발생하는 에러.
                            //이 경우, 해당 User에 대한 추천스케쥴을 지우고, 해당 유저의 isLogin 필드는 false로 변경한다.
                            for(var i = 0 ; i<triggers.length;i++){
                                if(triggers[i].userId == id){
                                    triggers[i].job.cancel()
                                    triggers.splice(i,1)
                                    console.log("device not registered, remove trigger. after trigger length: ",triggers.length)
                                    break;
                                }
                            }
                            await client.user.update({
                                where:{
                                    id    
                                },
                                data:{
                                    isLogin:false
                                }
                            })
                        }
                        }
                    }
                    }
                }
                catch(e){ 
                    console.error(e)
                }
            }

        }
    }

 }