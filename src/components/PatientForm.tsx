import { useState } from 'react';
import axios from 'axios';
import { usePatientStore } from '../store/usePatientStore';

export default function PatientForm() {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const setPatientId = usePatientStore((state) => state.setPatientId);

  const handleJoin = async () => {
    const res = await axios.post('/api/patient-join', { name, reason });
    setPatientId(res.data.patient.id);
  };

  return (
    <div className="p-3">
      <h4>Enter Waiting Room</h4>
      <input placeholder="Name" onChange={(e) => setName(e.target.value)} className="form-control mb-2" />
      <input placeholder="Reason" onChange={(e) => setReason(e.target.value)} className="form-control mb-2" />
      <button onClick={handleJoin} className="btn btn-primary">Join</button>
    </div>
  );
}