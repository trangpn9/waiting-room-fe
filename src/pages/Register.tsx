import { useEffect } from "react";
import { useRegister } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const schema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  password_confirmation: yup.string().min(6).required(),
  role: yup.string().oneOf(["doctor", "patient"]).required(),
});

type RegisterForm = yup.InferType<typeof schema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({ resolver: yupResolver(schema) });
  const registerMutation = useRegister();
  const navigate = useNavigate();
  const { token, role } = useAuthStore();
  const location = useLocation();


  useEffect(() => {
    if (token && role) {
      const redirectTo = role === "doctor" ? "/doctor" : "/patient";
      navigate(redirectTo, { replace: true });
    }
  }, [token, role, navigate]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await registerMutation.mutateAsync(data);
      const token = res.data.access_token;
      // Lưu token vào Zustand store
      useAuthStore.getState().login(token);

      // Giải mã JWT để lấy role
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      // Redirect dựa vào role hoặc nơi bị chặn trước đó
      const redirectTo = location.state?.from?.pathname || (role === "doctor" ? "/doctor" : "/patient");

      navigate(redirectTo, { replace: true });

    } catch {}
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("name")} className="form-control my-2" placeholder="Your Name" />
        {errors.name && <p className="text-danger">{errors.name.message}</p>}
        <input {...register("email")} className="form-control my-2" placeholder="Email" />
        {errors.email && <p className="text-danger">{errors.email.message}</p>}
        <input {...register("password")} type="password" className="form-control my-2" placeholder="Password" />
        {errors.password && <p className="text-danger">{errors.password.message}</p>}
        <input {...register("password_confirmation")} type="password" className="form-control my-2" placeholder="Password confirmation" />
        {errors.password_confirmation && <p className="text-danger">{errors.password_confirmation.message}</p>}
        <select {...register("role")} className="form-control my-2">
          <option value="">Chọn vai trò</option>
          <option value="doctor">Doctor</option>
          <option value="patient">Patient</option>
        </select>
        {errors.role && <p className="text-danger">{errors.role.message}</p>}
        {registerMutation.isError && <div className="alert alert-danger">Đăng ký thất bại</div>}
        <button className="btn btn-success" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}