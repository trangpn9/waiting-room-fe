import { useAuthStore } from "./../store/authStore";

export default function DashboardDoctor() {
  const {logout} = useAuthStore();
 
  return (
    <div className="container mt-5">
      <h2>Bảng điều khiển Bác sĩ</h2>
      <p>Chào mừng bạn đến với dashboard của bác sĩ.</p>
      <button className="btn btn-danger" type="button" onClick={logout}>Logout</button>
    </div>
  );
}