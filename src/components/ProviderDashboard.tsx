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
    if (data) {
      setPatients(data);
    }
  }, [data]);

  useEffect(() => {
    const pusher = createPusherClient();
    const channel = pusher.subscribe("waiting-room");

    channel.bind("patient-joined", (patient: Patient) => {
      setPatients((prev) => [...prev, patient]);
      console.log("Chanel subscribe: ", patients)
    });

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

  const getWaitTime = (created_at?: string | number): string =>{
    if (!created_at) return "";
    const createdTime = new Date(created_at).getTime();
    const diff = Date.now() - createdTime;
    const minutes = Math.floor(diff / 60000);
    return isNaN(minutes) ? "" : `${minutes} phút`;
  }

  const sorted = [...patients].sort((a, b) =>
    sortType === 'name' ? a.name.localeCompare(b.name) : parseInt(a.created_at) - parseInt(b.created_at)
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
            <span style={{ color: parseInt(getWaitTime(p.created_at)) > 2 ? 'red' : 'black' }}>
              {getWaitTime(p.created_at)}
            </span>
            <button onClick={() => callPatient(p)} className="btn btn-sm btn-success ms-2">Call</button>
          </li>
        ))}
      </ul>
    </div>
  );
}