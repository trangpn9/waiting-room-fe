import { useEffect, useState } from 'react';
import { usePatientStore } from '../store/usePatientStore';
import { createPusherClient } from '../hooks/usePusher';
import { useExitPatient } from '../hooks/usePatient';

export default function PatientStatus() {
  const patientId = usePatientStore((state) => state.patientId);
  const clearPatientId = usePatientStore((state) => state.clearPatientId);
  const exitMutation = useExitPatient();
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
    if (patientId === null) {
      throw new Error("Missing patientId in localStorage!");
    }
    await exitMutation.mutateAsync({patientId})
    clearPatientId();
  };

  return (
    <div className="p-3 col-8">
      <h4>Status: {message}</h4>
      <div className="d-grid gap-2 col-6 mx-auto">
        <button onClick={exitRoom} className="btn btn-danger mt-2">Exit Waiting Room</button>
      </div>
    </div>
  );
}