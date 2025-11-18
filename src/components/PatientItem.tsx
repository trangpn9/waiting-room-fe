import { useEffect, useState } from "react";
import { Patient } from "../utils/types";
import { useCallPatient } from "../hooks/usePatient";
import ChatBox from "./ChatBox";

export default function PatientItem({
  patient,
}: {
  patient: Patient;
}) {
  const [waitTime, setWaitTime] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const callPatientMutation = useCallPatient();

  // Independent timer for each patient
  useEffect(() => {
    const calcTime = () => {
      const created = new Date(patient.created_at).getTime();
      const diff = Date.now() - created;
      const minutes = Math.floor(diff / 60000);
      setWaitTime(minutes);
    };

    calcTime(); // run immediately
    const timer = setInterval(calcTime, 10000); // refresh every 10s

    return () => clearInterval(timer);
  }, [patient.created_at]);

  const callPatient = async (p: Patient) => {
    await callPatientMutation.mutateAsync({ patientId: p.id });
  };

  return (
    <li className="list-group-item">
      <div className="d-flex justify-content-between align-items-center">
        <span>
          {patient.name} – {patient.reason}
        </span>
        <div className="d-flex align-items-center">
          <span
            style={{ color: waitTime > 10 ? "red" : "brown" }}
            className="badge rounded-pill text-bg-warning"
          >
            {waitTime} phút
          </span>
          <button
            onClick={() => setIsChatOpen((prev) => !prev)}
            className="btn btn-sm btn-primary ms-2"
          >
            {isChatOpen ? "Đóng chat" : "Chat"}
          </button>
          <button
            onClick={() => callPatient(patient)}
            className="btn btn-sm btn-success ms-2"
          >
            Call
          </button>
        </div>
      </div>

      {isChatOpen && (
        <div className="mt-2">
          <ChatBox patientId={patient.id} role="doctor" />
        </div>
      )}
    </li>
  );
}
