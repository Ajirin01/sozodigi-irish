// /lib/webrtcWidget.js

import io from "socket.io-client";

export function createWebRTCWidget(options = {}) {
    const defaultSettings = {
        serverUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
        roomId: null,
        container: null,
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ],
        onCallStarted: () => {},
        onCallEnded: () => {},
        onIncomingCall: () => {},
        onCallRejected: () => {},
        onCallAccepted: () => {}
    };

    const settings = { ...defaultSettings, ...options };
    const socket = io(settings.serverUrl);

    let localStream;
    let remoteStream = new MediaStream();
    let peerConnection;

    let localVideo = settings.localVideoElement || null;
    let remoteVideo = settings.remoteVideoElement || null;

    function joinRoom(roomId) {
        settings.roomId = roomId;
        socket.emit("join-room", roomId);
        console.log(`🔗 Joined room: ${roomId}`);
    }

    function createPeerConnection() {
        const pc = new RTCPeerConnection({ iceServers: settings.iceServers });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", { roomId: settings.roomId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track);
            });
            if (remoteVideo) remoteVideo.srcObject = event.streams[0];
        };

        return pc;
    }

    async function startCall() {
        if (!settings.roomId) {
            console.error("❌ Room ID not set. Call joinRoom(roomId) first.");
            return;
        }

        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            if (localVideo) localVideo.srcObject = localStream;

            peerConnection = createPeerConnection();
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit("offer", { roomId: settings.roomId, offer });
        } catch (error) {
            console.error("❌ Error accessing media devices:", error);
        }
    }

    function endCall() {
        if (peerConnection) peerConnection.close();
        if (localStream) localStream.getTracks().forEach(track => track.stop());
        settings.onCallEnded();
    }

    function toggleMuteAudio() {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
        }
    }

    function toggleMuteVideo() {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
        }
    }

    function sendCallRequest() {
        socket.emit("call-request", { roomId: settings.roomId });
    }

    function acceptCall() {
        socket.emit("call-accepted", { roomId: settings.roomId });
        startCall();
    }

    function rejectCall() {
        socket.emit("call-rejected", { roomId: settings.roomId });
    }

    // Socket event handlers
    socket.on("offer", async ({ offer }) => {
        console.log("📩 Incoming call...");

        peerConnection = createPeerConnection();
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideo) localVideo.srcObject = localStream;
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("answer", { roomId: settings.roomId, answer });
    });

    socket.on("answer", async ({ answer }) => {
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    });

    socket.on("ice-candidate", ({ candidate }) => {
        if (peerConnection) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    });

    socket.on("call-request", () => {
        settings.onIncomingCall();
    });

    socket.on("call-rejected", () => {
        settings.onCallRejected();
    });

    socket.on("call-accepted", () => {
        settings.onCallAccepted();
    });

    return {
        joinRoom,
        startCall,
        endCall,
        toggleMuteAudio,
        toggleMuteVideo,
        sendCallRequest,
        acceptCall,
        rejectCall
    };
}
