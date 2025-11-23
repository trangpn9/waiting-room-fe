import { useEffect } from "react";
import { useLogin } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const schema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
  password: yup.string().min(6, "Tối thiểu 6 ký tự").required("Vui lòng nhập mật khẩu"),
});

type LoginForm = yup.InferType<typeof schema>;

export default function Login() {
  const { token, role, logout } = useAuthStore();
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (token && role) {
      const redirectTo = role === "doctor" ? "/doctor" : "/patient";
      navigate(redirectTo, { replace: true });
    }
  }, [token, role, navigate]);



  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await loginMutation.mutateAsync(data);
      const token = res.data.access_token;
      // clear all session
      logout();

      // Lưu token vào Zustand store
      useAuthStore.getState().login(token);

      // Giải mã JWT để lấy role
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      // Redirect dựa vào role hoặc nơi bị chặn trước đó
      const redirectTo =
        location.state?.from?.pathname || (role === "doctor" ? "/doctor" : "/patient");

      navigate(redirectTo, { replace: true });

      console.log("Đăng nhập thành công:", { token, role, redirectTo });
    } catch (err) {
      console.error("Đăng nhập thất bại", err);
    }
  };

  return (
    <div className="container mt-5 text-center" style={{ maxWidth: 400 }}>
      <h2 className="mb-4">Đăng nhập</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <input
            {...register("email")}
            className="form-control"
            placeholder="Email"
          />
          {errors.email && (
            <small className="text-danger">{errors.email.message}</small>
          )}
        </div>

        <div className="mb-3">
          <input
            {...register("password")}
            type="password"
            className="form-control"
            placeholder="Mật khẩu"
          />
          {errors.password && (
            <small className="text-danger">{errors.password.message}</small>
          )}
        </div>

        {loginMutation.isError && (
          <div className="alert alert-danger">Đăng nhập thất bại. Vui lòng kiểm tra lại.</div>
        )}

        <button className="btn btn-primary w-100" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}