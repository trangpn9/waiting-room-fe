import { useEffect, useState } from "react";
import { Patient } from "../utils/types";
import { useCallPatient } from "../hooks/usePatient";

export default function PatientItem({
    patient
}: {
    patient: Patient;
}) {
    const [waitTime, setWaitTime] = useState(0);
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
        <li className="list-group-item d-flex justify-content-between align-items-center">
            {patient.name} – {patient.reason}
            <span style={{ color: waitTime > 10 ? "red" : "brown" }} className="badge rounded-pill text-bg-warning">
                {waitTime} phút
            </span>
            <button
                onClick={() => console.log("Chat: ", patient.id)}
                className="btn btn-sm btn-primary ms-2"
            >
                Chat
            </button>
            <button
                onClick={() => callPatient(patient)}
                className="btn btn-sm btn-success ms-2"
            >
                Call
            </button>
        </li>
    );
}