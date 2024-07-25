import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

declare const AgoraRTM: any;

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {

  private APP_ID = '08758868191c478d8cf98dc0081eda79'
  private uid = uuidv4()
  private token = null
  private client: any
  private channel: any

  constructor() { }

  getClient(){
    return this.client
  }

  getChannel(){
    return this.channel
  }

  async initialize(roomId: any): Promise<void> {
    try {
      this.client = await AgoraRTM.createInstance(this.APP_ID);
      await this.client.login({ uid: this.uid });
      console.log('Login Successful');

      this.channel = this.client.createChannel(roomId);
      await this.channel.join();
    } catch (error) {
      console.error('Error initializing client and channel:', error);
    }
  }

  sendMessageToPeer(Message: any, MemberId: any){
    this.client.sendMessageToPeer(Message, MemberId);
  }
}
