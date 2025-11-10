import { useEffect, useState } from 'react';
import { Patient } from '../utils/types';
import axios from 'axios';
import { createPusherClient } from '../hooks/usePusher';
import { useGetPatients } from '../hooks/usePatient';

export default function ProviderDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sortType, setSortType] = useState<'name' | 'time'>('time');
  const listPatientsMutation = useGetPatients();

  useEffect(() => {
    axios.get('/patient/list').then((res) => setPatients(res.data));
    // const res = await listPatientsMutation

    const pusher = createPusherClient();
    const channel = pusher.subscribe('waiting-room');

    channel.bind('patient-joined', (data: Patient) => {
      setPatients((prev) => [...prev, data]);
    });

    channel.bind('patient-exit', (data: { id: string }) => {
      setPatients((prev) => prev.filter((p) => p.id !== data.id));
    });

    return () => {
      pusher.unsubscribe('waiting-room');
      pusher.disconnect();
    };
  }, []);

  const callPatient = async (p: Patient) => {
    await axios.post('/api/call-patient', { patientId: p.id });
  };

  const getWaitTime = (createdAt: number) =>
    Math.floor((Date.now() - createdAt) / 60000);

  const sorted = [...patients].sort((a, b) =>
    sortType === 'name' ? a.name.localeCompare(b.name) : a.createdAt - b.createdAt
  );

  return (
    <div className="p-3">
      <h4>Provider Dashboard</h4>
      <button className="btn btn-outline-secondary me-2" onClick={() => setSortType('name')}>Sort by Name</button>
      <button className="btn btn-outline-secondary" onClick={() => setSortType('time')}>Sort by Time</button>

      <ul className="mt-3">
        {sorted.map((p) => (
          <li key={p.id}>
            {p.name} - {p.reason} -
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