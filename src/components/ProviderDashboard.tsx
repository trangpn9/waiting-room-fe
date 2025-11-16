import { useEffect, useState } from 'react';
import { Patient } from '../utils/types';
import { createPusherClient } from '../hooks/usePusher';
import { useCallPatient, useGetPatients } from '../hooks/usePatient';

export default function ProviderDashboard() {
  const { data, isLoading, isError, refetch } = useGetPatients();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sortType, setSortType] = useState<'name' | 'time'>('time');
  const callPatientMutation = useCallPatient();

  useEffect(() => {
    if (data && patients.length === 0) {
      setPatients(data);
    }
  }, [data]);

  useEffect(() => {
    const pusher = createPusherClient();
    const channel = pusher.subscribe("waiting-room");

    console.log("Subscribed to waiting-room channel!");

    // Listen to all events for debug
    channel.bind_global((eventName: string, data: any) => {
      console.log("🔥 GLOBAL EVENT RECEIVED:", eventName, data);
    });

    // FIX: Correctly extract patient payload
    channel.bind("patient-joined", (data: { patient: Patient }) => {
      const patient = data.patient;
      setPatients((prev) => {
        // avoid duplicates
        if (prev.find((p) => p.id === patient.id)) return prev;
        return [...prev, patient];
      });
    });

    // FIX: Correct exit payload
    channel.bind("patient-exit", (data: { id: string }) => {
      setPatients((prev) => prev.filter((p) => p.id !== data.id));
    });

    return () => {
      pusher.unsubscribe("waiting-room");
      pusher.disconnect();
    };
  }, []);

  const callPatient = async (p: Patient) => {
    await callPatientMutation.mutateAsync({ patientId: p.id });
  };

  const getWaitTime = (created_at?: string | number): number =>{
    if (!created_at) return 0;
    const createdTime = new Date(created_at).getTime();
    const diff = Date.now() - createdTime;
    const minutes = Math.floor(diff / 60000);
    return isNaN(minutes) ? 0 : minutes;
  }

  const sorted = [...patients].sort((a, b) =>
    sortType === 'name' ? a.name.localeCompare(b.name) : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (isLoading) return <p>Đang tải danh sách bệnh nhân...</p>;
  if (isError) return <p>Lỗi khi tải danh sách.</p>;

  return (
    <div className="p-3">
      <h4>Provider Dashboard</h4>
      <button className="btn btn-outline-secondary me-2" onClick={() => setSortType('name')}>Sort by Name</button>
      <button className="btn btn-outline-secondary" onClick={() => setSortType('time')}>Sort by Time</button>

      <ul className="mt-3">
        {sorted.map((p) => (
          <li key={p.id}>
            {p.name} - {p.reason} -{" "}
            <span style={{ color: getWaitTime(p.created_at) > 10 ? 'red' : 'brown' }}>
              {getWaitTime(p.created_at)}<i style={{marginLeft: '0.5rem'}}>phút</i>
            </span>
            <button onClick={() => callPatient(p)} className="btn btn-sm btn-success ms-2">Call</button>
          </li>
        ))}
      </ul>
    </div>
  );
}