import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useSocket } from '../services/useSocket';
import { useAuth } from '../context/AuthContext';

const CallModal = () => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [callState, setCallState] = useState('idle'); // idle, calling, ringing, connected
  const [caller, setCaller] = useState(null); // { id, name, avatar }
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('call-made', async (data) => {
       setCaller({ id: data.from, name: data.name, avatar: data.avatar });
       setCallState('ringing');
       window.pendingOffer = data.signal; 
    });

    socket.on('call-answered', async (signal) => {
      setCallState('connected');
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      }
    });

    socket.on('ice-candidate', async (candidate) => {
      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error(e);
        }
      }
    });

    socket.on('call-ended', () => {
      endCallCleanup();
    });

    socket.on('call-rejected', () => {
      alert("Call rejected");
      endCallCleanup();
    });

    return () => {
      socket.off('call-made');
      socket.off('call-answered');
      socket.off('ice-candidate');
      socket.off('call-ended');
      socket.off('call-rejected');
    };
  }, [socket]);

  useEffect(() => {
    window.makeCall = async (userToCallId, isVideo = true, userName) => {
      if (!socket || callState !== 'idle') return;
      
      setCallState('calling');
      setCaller({ id: userToCallId, name: userName || 'Calling...', avatar: '' });

      const stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = createPeerConnection(userToCallId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call-user', {
        userToCall: userToCallId,
        signalData: offer,
        from: user._id,
        name: user.username,
        avatar: user.avatar
      });
    };
  }, [socket, callState, user]);

  const createPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { to: targetUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const answerCall = async () => {
    setCallState('connected');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = createPeerConnection(caller.id);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(window.pendingOffer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit('answer-call', { to: caller.id, signal: answer });
  };

  const rejectCall = () => {
    socket.emit('reject-call', { to: caller.id });
    endCallCleanup();
  };

  const endCall = () => {
    if (caller?.id) {
      socket.emit('end-call', { to: caller.id });
    }
    endCallCleanup();
  };

  const endCallCleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
    setCaller(null);
    window.pendingOffer = null;
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  if (callState === 'idle') return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Remote Video (Full Screen) */}
      <video 
        ref={remoteVideoRef} 
        autoPlay 
        playsInline 
        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', display: callState === 'connected' && remoteStream ? 'block' : 'none' }} 
      />

      {/* Local Video (PiP) */}
      <video 
        ref={localVideoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ width: '200px', height: '150px', objectFit: 'cover', position: 'absolute', bottom: '120px', right: '40px', borderRadius: '12px', border: '2px solid white', backgroundColor: '#333', zIndex: 10, display: (callState === 'calling' || callState === 'connected') ? 'block' : 'none' }} 
      />

      {/* Ringing UI */}
      {callState === 'ringing' && (
        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <img src={caller.avatar || 'https://ui-avatars.com/api/?name=' + caller.name} style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '24px' }}/>
           <h2 style={{ color: 'white', marginBottom: '8px' }}>{caller.name}</h2>
           <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Incoming Call...</p>
           
           <div style={{ display: 'flex', gap: '40px' }}>
              <button onClick={rejectCall} style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ff4d4f', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <PhoneOff size={28} color="white" />
              </button>
              <button onClick={answerCall} style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#25D366', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', animation: 'pulse 1.5s infinite' }}>
                <Phone size={28} color="white" />
              </button>
           </div>
        </div>
      )}

      {/* Calling UI */}
      {callState === 'calling' && (
        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-100px' }}>
           <h2 style={{ color: 'white', marginBottom: '8px' }}>{caller.name}</h2>
           <p style={{ color: 'var(--text-secondary)' }}>Calling...</p>
        </div>
      )}

      {/* Controls Wrapper */}
      {callState !== 'ringing' && (
        <div style={{ position: 'absolute', bottom: '40px', display: 'flex', gap: '24px', zIndex: 10, padding: '16px 32px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '32px' }}>
          <button onClick={toggleAudio} style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: isAudioMuted ? '#ff4d4f' : 'rgba(255,255,255,0.2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {isAudioMuted ? <MicOff size={20} color="white" /> : <Mic size={20} color="white" />}
          </button>
          
          <button onClick={toggleVideo} style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: isVideoMuted ? '#ff4d4f' : 'rgba(255,255,255,0.2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {isVideoMuted ? <VideoOff size={20} color="white" /> : <Video size={20} color="white" />}
          </button>
          
          <button onClick={endCall} style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ff4d4f', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <PhoneOff size={20} color="white" />
          </button>
        </div>
      )}

    </div>
  );
};

export default CallModal;
