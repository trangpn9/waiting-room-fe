import { useEffect, useState } from "react";
import { Patient } from "../utils/types";

export default function PatientItem({
  patient,
  onCall,
}: {
  patient: Patient;
  onCall: (p: Patient) => void;
}) {
  const [waitTime, setWaitTime] = useState(0);

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

  return (
    <li>
      {patient.name} – {patient.reason} –{" "}
      <span style={{ color: waitTime > 10 ? "red" : "brown" }}>
        {waitTime} phút
      </span>
      <button
        onClick={() => onCall(patient)}
        className="btn btn-sm btn-success ms-2"
      >
        Call
      </button>
    </li>
  );
}