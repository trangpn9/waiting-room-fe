import { useEffect, useState } from 'react';
import { usePatientStore } from '../store/usePatientStore';
import { createPusherClient } from '../hooks/usePusher';
import axios from 'axios';

export default function PatientStatus() {
  const patientId = usePatientStore((state) => state.patientId);
  const clearPatientId = usePatientStore((state) => state.clearPatientId);
  const [message, setMessage] = useState('Waiting...');

  useEffect(() => {
    if (!patientId) return;

    const pusher = createPusherClient();
    const channel = pusher.subscribe(`patient-${patientId}`);

    channel.bind('status-update', (data: { content: string }) => {
      setMessage(data.content);
    });

    return () => {
      pusher.unsubscribe(`patient-${patientId}`);
      pusher.disconnect();
    };
  }, [patientId]);

  const exitRoom = async () => {
    await axios.post('/patient/exit', { patientId });
    clearPatientId();
  };

  return (
    <div className="p-3">
      <h4>Status: {message}</h4>
      <button onClick={exitRoom} className="btn btn-danger mt-2">Exit Waiting Room</button>
    </div>
  );
}