import { useLogin } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

type LoginForm = yup.InferType<typeof schema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: yupResolver(schema) });
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data);

      // const role = JSON.parse(atob(loginMutation.data?.data.token.split(".")[1])).role;
      // navigate(role === "doctor" ? "/doctor" : "/patient");
      
      const token = loginMutation.data?.data.token;
      const role = JSON.parse(atob(token.split(".")[1])).role;
      const redirectTo = location.state?.from?.pathname || (role === "doctor" ? "/doctor" : "/patient");
      navigate(redirectTo, { replace: true });
    } catch {}
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("email")} className="form-control my-2" placeholder="Email" />
        {errors.email && <p className="text-danger">{errors.email.message}</p>}
        <input {...register("password")} type="password" className="form-control my-2" placeholder="Password" />
        {errors.password && <p className="text-danger">{errors.password.message}</p>}
        {loginMutation.isError && <div className="alert alert-danger">Đăng nhập thất bại</div>}
        <button className="btn btn-primary" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}