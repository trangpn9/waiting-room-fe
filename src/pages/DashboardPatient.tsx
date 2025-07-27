import { useAuthStore } from "./../store/authStore";

export default function DashboardPatient() {
  const {logout} = useAuthStore();

  return (
    <div className="container mt-5">
      <h2>Bảng điều khiển Bệnh nhân</h2>
      <p>Chào mừng bạn đến với dashboard của bệnh nhân.</p>
      <button className="btn btn-danger" type="button" onClick={logout}>Logout</button>
    </div>
  );
}
