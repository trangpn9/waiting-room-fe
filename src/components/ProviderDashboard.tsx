import { useEffect, useState } from 'react';
import { Patient } from '../utils/types';
import { createPusherClient } from '../hooks/usePusher';
import { useGetPatients } from '../hooks/usePatient';
import PatientItem from './PatientItem';

export default function ProviderDashboard() {
  const { data, isLoading, isError, refetch } = useGetPatients();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sortType, setSortType] = useState<'name' | 'time'>('time');

  useEffect(() => {
    if (data && patients.length === 0) {
      setPatients(data);
    }
  }, [data]);

  useEffect(() => {
    const pusher = createPusherClient();
    const channel = pusher.subscribe("waiting-room");

    // console.log("Subscribed to waiting-room channel!");

    // // Listen to all events for debug
    // channel.bind_global((eventName: string, data: any) => {
    //   console.log("🔥 GLOBAL EVENT RECEIVED:", eventName, data);
    // });

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

  const sorted = [...patients].sort((a, b) =>
    sortType === 'name' ? a.name.localeCompare(b.name) : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (isLoading) return <p>Đang tải danh sách bệnh nhân...</p>;
  if (isError) return <p>Lỗi khi tải danh sách.</p>;

  return (
    <div className="p-3">
      <h4>Provider Dashboard</h4>
      <div className="mb-3">
        <button className="btn btn-outline-secondary me-2" onClick={() => setSortType('name')}>Sort by Name</button>
        <button className="btn btn-outline-secondary" onClick={() => setSortType('time')}>Sort by Time</button>
      </div>

      <ul className="list-group">
        {sorted.map((p) => (
          <PatientItem key={p.id} patient={p} />
        ))}
      </ul>
    </div>
  );
}