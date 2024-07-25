import {
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  HostListener
} from '@angular/core';
import { WebrtcService } from '../services/webrtc.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-peerchat',
  standalone: true,
  imports: [],
  templateUrl: './peerchat.component.html',
  styleUrl: './peerchat.component.css'
})
export class PeerchatComponent {

  client: any;
  channel: any;

  roomId!: string | null;

  server = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
  };

  localStream!: MediaStream;
  remoteStream!: MediaStream;

  user2Joined = false;

  peerConnections: { [key: string]: RTCPeerConnection } = {};

  @ViewChild('localVideoPlayer')
  localVideoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideoPlayer')
  remoteVideoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private wrtc: WebrtcService,
    private zone: NgZone,
    private actrouter: ActivatedRoute,
    private router: Router
  ) {}

  constraints = {
    video: {
      width: {min: 640, ideal: 1920, max: 1920},
      height: {min: 480, ideal: 1080, max: 1080}
    },
    audio: true,
  }

  async ngOnInit(): Promise<void> {
    try {
      this.actrouter.queryParams.subscribe(params => {
        this.roomId = params['room']
      })
      await this.wrtc.initialize(this.roomId);
      this.client = this.wrtc.getClient();
      this.channel = this.wrtc.getChannel();

      this.client.on('MessageFromPeer', (message: any, MemberId: any) =>
        this.handleMessage(message, MemberId)
      );
      this.channel.on('MemberJoined', (MemberId: any) =>
        this.handleJoinedUser(MemberId)
      );

      this.channel.on('MemberLeft', () => 
        this.handleUserLeft()
      )

      this.localStream = await navigator.mediaDevices.getUserMedia(this.constraints);
      this.localVideoPlayer.nativeElement.srcObject = this.localStream;
    } catch (error) {
      console.error('Error initializing component:', error);
    }
  }

  handleMessage(message: any, MemberId: any) {
    let parsedMessage = JSON.parse(message.text);
    switch (parsedMessage.type) {
      case 'offer':
        this.createAnswer(MemberId, parsedMessage.offer);
        break;
      case 'answer':
        this.addAnswer(MemberId, parsedMessage.answer);
        break;
      case 'candidate':
        this.peerConnections[MemberId].addIceCandidate(parsedMessage.candidate);
        break;
      default:
        console.log('Invalid message type');
    }
  }

  handleJoinedUser(MemberId: any) {
    console.log('New user joined with id: ' + MemberId);
    this.createOffer(MemberId);
  }

  handleUserLeft(){
    const user2Element = document.getElementById('user2');
    const user1Element = document.getElementById('user1')
    if (user2Element && user1Element) {
      user2Element.style.display = 'none';
      user1Element.classList.remove('smallFrame')
    } 
  }

  async createPeerConnection(MemberId: any) {
    const peerConn = new RTCPeerConnection(this.server);
    const user2Element = document.getElementById('user2');
    const user1Element = document.getElementById('user1')
    if (user2Element && user1Element) {
      user2Element.style.display = 'block';
      user1Element.classList.add('smallFrame')
    } else {
      console.error("Element with id 'user2' not found.");
    }

    if (this.remoteVideoPlayer && this.remoteVideoPlayer.nativeElement) {
      console.log('Running');
      this.remoteStream = new MediaStream();
      this.remoteVideoPlayer.nativeElement.srcObject = this.remoteStream;

      peerConn.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          this.remoteStream.addTrack(track);
        });
      };
    } else {
      console.error('Not running');
    }

    if (this.localStream && this.localStream.getTracks()) {
      this.localStream.getTracks().forEach((track) => {
        peerConn.addTrack(track, this.localStream);
      });
    }

    peerConn.onicecandidate = (event) => {
      if (event.candidate) {
        this.wrtc.sendMessageToPeer(
          {
            text: JSON.stringify({
              type: 'candidate',
              candidate: event.candidate,
            }),
          },
          MemberId
        );
      }
    };

    this.peerConnections[MemberId] = peerConn;
    return peerConn;
  }

  async createOffer(MemberId: any) {
    const peerConn = await this.createPeerConnection(MemberId);

    let offer = await peerConn.createOffer();
    await peerConn.setLocalDescription(offer);

    this.wrtc.sendMessageToPeer(
      { text: JSON.stringify({ type: 'offer', offer: offer }) },
      MemberId
    );
  }

  async createAnswer(MemberId: any, offer: any) {
    const peerConn = await this.createPeerConnection(MemberId);

    await peerConn.setRemoteDescription(offer);

    const answer = await peerConn.createAnswer();
    await peerConn.setLocalDescription(answer);

    this.wrtc.sendMessageToPeer(
      { text: JSON.stringify({ type: 'answer', answer: answer }) },
      MemberId
    );
  }

  async addAnswer(MemberId: any, answer: any) {
    const peerConn = this.peerConnections[MemberId];
    if (peerConn && !peerConn.currentRemoteDescription) {
      peerConn.setRemoteDescription(answer);
    }
  }

  async leaveChannel(){
    await this.channel.leave()
    await this.channel.logout()
  }

  @HostListener('window:beforeunload', ['$event'])
  async onBeforeUnload(event: BeforeUnloadEvent): Promise<void> {
    await this.leaveChannel();
  }

  toggleCamera(){
    let video = this.localStream.getTracks().find(track => track.kind === 'video')
    let camera = document.getElementById('camera')
    if(video && video.enabled && camera){
      video.enabled = false
      camera.style.backgroundColor = 'red'
    } else if (video && camera){
      video.enabled = true
      camera.style.backgroundColor = 'blueviolet'
    }
  }

  toggleMic(){
    let audio = this.localStream.getTracks().find(track => track.kind === 'audio')
    let mic = document.getElementById('mic')
    if(audio && audio.enabled && mic){
      audio.enabled = false
      mic.style.backgroundColor = 'red'
    } else if (audio && mic){
      audio.enabled = true
      mic.style.backgroundColor = 'blueviolet'
    }
  }

  leave(){
    this.handleUserLeft()
    this.leaveChannel()
    this.router.navigate(['/lobby'])
  }
}
