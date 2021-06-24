import client from "../../client"
import * as seeFeed from "../seeFeed/seeFeedLogic"
import {Expo} from 'expo-server-sdk'
import { triggers } from "../../schedule";
export default{
    Query:{
        test: async (_,{id}) =>{
           const {token} = await client.user.findUnique({
                where:{
                    id
                },
                select:{
                    token:true
                }
            })
            const result = await seeFeed.default({id})
            console.log("result",result)
            console.log("token:", token)
            client.author.findUnique({
                where:{
                    id:result[0].authorId
                },
                select:{
                    name:true
                }
            })
            if(!Expo.isExpoPushToken(token)){
                console.error(`push tken ${token} is not valid`)
            }
            else{
                let expo = new Expo();
                let msg = []
                msg.push({
                    to: token,
                    sound: 'default',
                    title: '세-하(세현이형하이라는뜻 ㅎ)',
                    body : 'test notification',
                    data: result[0]

                })

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
                console.log("tickets: ",tickets)
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

                                for(var i = 0 ; i<triggers.length;i++){
                                    if(triggers[i].userId == id){
                                        triggers[i].job.cancel()
                                        triggers.splice(i,1)
                                        console.log("after logout, trigger length: ",triggers.length)
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
};