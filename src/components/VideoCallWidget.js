import { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import { createWebRTCWidget } from '@/lib/webrtcWidget';


const VideoCallWidget = ({ roomId }) => {
    const [isCallIncoming, setIsCallIncoming] = useState(false);
    const [isInCall, setIsInCall] = useState(false);
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const webrtcInstance = useRef(null);
    const socket = useRef(null);

    useEffect(() => {
        if (!roomId || webrtcInstance.current) return;
    
        socket.current = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    
        webrtcInstance.current = createWebRTCWidget({
            videoSize: 500,
            backgroundColor: '#f8f9fa',
            localVideoElement: localVideoRef.current,
            remoteVideoElement: remoteVideoRef.current,
            onCallAccepted: () => {
                setIsCallIncoming(false);
                setIsInCall(true);
            },
            onIncomingCall: () => {
                setIsCallIncoming(true);
            },
            onCallEnded: () => {
                setIsInCall(false);
                setIsCallIncoming(false);
            }
        });
    
        webrtcInstance.current.joinRoom(roomId);
    
        return () => {
            if (webrtcInstance.current) {
                webrtcInstance.current.endCall();
                webrtcInstance.current = null;
            }
        };
    }, [roomId]);
    

    const sendCallRequest = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.sendCallRequest();
            // setIsCallIncoming(true);
        }
    };

    const endCall = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.endCall();
        }
        setIsInCall(false);
    };

    const toggleMuteAudio = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.toggleMuteAudio();
            setAudioMuted(!audioMuted);
        }
    };

    const toggleMuteVideo = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.toggleMuteVideo();
            setVideoMuted(!videoMuted);
        }
    };

    const acceptCall = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.acceptCall();
            setIsCallIncoming(false);
        }
    };

    const rejectCall = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.rejectCall();
            setIsCallIncoming(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="flex gap-4">
                <div className="resizable border-blue-500">
                    <video ref={localVideoRef} autoPlay muted playsInline className="video-element" />
                </div>
                <div className="resizable border-green-500">
                    <video ref={remoteVideoRef} autoPlay playsInline className="video-element" />
                </div>
            </div>

            {/* Incoming call notification */}
            {isCallIncoming && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4">
                    <p className="text-lg font-bold mb-4">📞 Incoming Call...</p>
                    <div className="flex gap-4">
                        <button onClick={acceptCall} className="bg-green-500 p-3 rounded-full hover:bg-green-600 transition">
                            Accept
                        </button>
                        <button onClick={rejectCall} className="bg-red-500 p-3 rounded-full hover:bg-red-600 transition">
                            Reject
                        </button>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-4 mt-6">
                {!isInCall && (
                    <button onClick={sendCallRequest} className="bg-blue-500 p-3 rounded-full hover:bg-blue-600 transition">
                        Start Call
                    </button>
                )}
                {isInCall && (
                    <>
                        <button onClick={endCall} className="bg-red-500 p-3 rounded-full hover:bg-red-600 transition">
                            End Call
                        </button>
                        <button onClick={toggleMuteAudio} className="bg-gray-700 p-3 rounded-full hover:bg-gray-800 transition">
                            {audioMuted ? 'Unmute Audio' : 'Mute Audio'}
                        </button>
                        <button onClick={toggleMuteVideo} className="bg-gray-700 p-3 rounded-full hover:bg-gray-800 transition">
                            {videoMuted ? 'Unmute Video' : 'Mute Video'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VideoCallWidget;
