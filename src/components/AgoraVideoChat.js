import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Rnd } from 'react-rnd';

const AgoraVideoChat = forwardRef(({ agoraAppId, agoraToken, agoraChannelName }, ref) => {
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [users, setUsers] = useState([]);
  const [mainUser, setMainUser] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const mainVideoRef = useRef(null); // new
  const thumbnailVideoRef = useRef(null); // new

  const clientRef = useRef(null);
  const localVideoRef = useRef(null);
  const audioTrackRef = useRef(null);
  const cleanupRef = useRef(false);

  useImperativeHandle(ref, () => ({
    endCall: async () => {
      cleanupRef.current = true;
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
        clientRef.current = null;
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }
      if (audioTrackRef.current) {
        audioTrackRef.current.stop();
        audioTrackRef.current.close();
      }
      setUsers([]);
      setMainUser(null);
    },
  }));

  const initializeAgoraCall = async () => {
    if (!agoraAppId || !agoraToken || !agoraChannelName) return;

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    client.on('user-published', async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setUsers((prev) => {
            if (prev.some((u) => u.uid === user.uid)) return prev;
            return [...prev, user];
          });
        }
        if (mediaType === 'audio') user.audioTrack?.play();
      } catch (err) {
        console.error("Subscribe failed:", err);
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      }
      if (mediaType === 'audio') user.audioTrack?.stop();
    });

    try {
      await client.join(agoraAppId, agoraChannelName, agoraToken, 0);
      if (cleanupRef.current) return;

      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      setLocalVideoTrack(videoTrack);
      audioTrackRef.current = audioTrack;

      videoTrack.play(localVideoRef.current);
      await client.publish([videoTrack, audioTrack]);
    } catch (err) {
      console.error("Agora init error:", err);
    }
  };

  useEffect(() => {
    cleanupRef.current = false;
    if (agoraAppId && agoraToken && agoraChannelName) initializeAgoraCall();
    return () => {
      cleanupRef.current = true;
      if (clientRef.current) {
        clientRef.current.leave();
        clientRef.current.removeAllListeners();
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      if (audioTrackRef.current) {
        audioTrackRef.current.stop();
        audioTrackRef.current.close();
      }
      setUsers([]);
    };
  }, [agoraAppId, agoraToken, agoraChannelName]);

  useEffect(() => {
    users.forEach((user) => {
      const container = document.getElementById(`remote-video-${user.uid}`);
      if (user.videoTrack && container) user.videoTrack.play(container);
    });
  }, [users]);

  const handleToggleCamera = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!isCameraOn);
      setIsCameraOn((prev) => !prev);
    }
  };

  const handleToggleMic = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.setEnabled(!isMicOn);
      setIsMicOn((prev) => !prev);
    }
  };

  return (
    <div className="relative w-full h-[80vh] bg-black rounded-xl overflow-hidden border shadow-lg">
      <div className="absolute top-0 left-0 w-full h-full">
        {mainUser ? (
          <div id={`remote-video-${mainUser.uid}`} className="w-full h-full" />
        ) : (
          <div ref={localVideoRef} className="w-full h-full" />
        )}
      </div>

      

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 items-center justify-center mt-20">
        <div
          onClick={() => setMainUser(null)}
          id="remoteVideoContainer" className="resizable border-green-500"
        >
          <div ref={localVideoRef} className="w-full h-full" />
          <div className="resize-handle"></div>
        </div>
        {users.map((user) => (
          <div
            key={user.uid}
            onClick={() => setMainUser(user)}
            className="resizable border-blue-500"
            id="localVideoContainer"
          >
            <div id={`remote-video-${user.uid}`} className="w-full h-full" />
            <div className="resize-handle"></div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/60 px-4 py-2 rounded-full">
        <button onClick={handleToggleMic} className="text-white hover:text-red-500">
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button onClick={handleToggleCamera} className="text-white hover:text-red-500">
          {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <button onClick={() => ref?.current?.endCall()} className="text-white hover:text-red-500">
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
});

export default AgoraVideoChat;
