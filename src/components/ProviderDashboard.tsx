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
    // await axios.post('/api/call-patient', { patientId: p.id });
    await callPatientMutation.mutateAsync({ patientId: p.id });
  };

  const getWaitTime = (createdAt: number) =>
    Math.floor((Date.now() - createdAt) / 60000);

  const sorted = [...patients].sort((a, b) =>
    sortType === 'name' ? a.name.localeCompare(b.name) : a.createdAt - b.createdAt
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
            <span style={{ color: getWaitTime(p.createdAt) > 2 ? 'red' : 'black' }}>
              {getWaitTime(p.createdAt)} phút
            </span>
            <button onClick={() => callPatient(p)} className="btn btn-sm btn-success ms-2">Call</button>
          </li>
        ))}
      </ul>
    </div>
  );
}