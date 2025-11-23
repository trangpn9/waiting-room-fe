import { useEffect, useState } from 'react';
import { usePatientStore } from '../store/usePatientStore';
import { createPusherClient } from '../hooks/usePusher';
import { useExitPatient } from '../hooks/usePatient';
import ChatBox from './ChatBox';

export default function PatientStatus() {
  const patientId = usePatientStore((state) => state.patientId);
  const clearPatientId = usePatientStore((state) => state.clearPatientId);
  const exitMutation = useExitPatient();
  const [message, setMessage] = useState('Waiting...');

  useEffect(() => {
    if (!patientId) return;

    const pusher = createPusherClient();
    const channel = pusher.subscribe(`private-chat.${patientId}`);

    channel.bind('status-update', (data: { content: string }) => {
      setMessage(data.content);
    });

    // Nhận tin nhắn chat từ bác sĩ
    // channel.bind("chat-message", (data: {content: string}) => {
    //   console.log("Patient received chat:", data);
    // });

    return () => {
      pusher.unsubscribe(`private-chat.${patientId}`);
      // pusher.disconnect();
    };
  }, [patientId]);

  const exitRoom = async () => {
    if (patientId === null) {
      throw new Error("Missing patientId in localStorage!");
    }
    await exitMutation.mutateAsync({patientId})
    clearPatientId();
  };

  return (
    <div className="p-3 col-8">
      <h4>Status: {message}</h4>
      {patientId && (
        <div className="mt-3">
          <h5>Chat với bác sĩ</h5>
          <ChatBox patientId={patientId} role="patient" />
        </div>
      )}      
      <button onClick={exitRoom} className="btn btn-danger mt-2">Exit Waiting Room</button>
    </div>
  );
}