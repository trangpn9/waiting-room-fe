import { useEffect } from "react";
import { useAuthStore } from "./../store/authStore";
import { usePatientStore } from "../store/usePatientStore";
import PatientStatus from "../components/PatientStatus";
import PatientForm from "../components/PatientForm";

export default function DashboardPatient() {
  const {logout} = useAuthStore();
  const setPatientId = usePatientStore((state) => state.setPatientId);
  const patientId = usePatientStore((state) => state.patientId);

  useEffect(() => {
    const saved = sessionStorage.getItem('patientId');
    if(saved) setPatientId(saved);
  },[]);

  return (
    <div className="container mt-5">
      <h2>Bảng điều khiển Bệnh nhân</h2>
      <p>Chào mừng bạn đến với dashboard của bệnh nhân.</p>
        <div className="col-md-6">
          {patientId ? <PatientStatus /> : <PatientForm />}
        </div>
      <hr/>
      <button className="btn btn-danger" type="button" onClick={logout}>Logout</button>
    </div>
  );
}
