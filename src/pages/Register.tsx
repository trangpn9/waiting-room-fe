import { useRegister } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

const schema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  role: yup.string().oneOf(["doctor", "patient"]).required(),
});

type RegisterForm = yup.InferType<typeof schema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({ resolver: yupResolver(schema) });
  const registerMutation = useRegister();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync(data);
      navigate("/login");
    } catch {}
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("name")} className="form-control my-2" placeholder="Name" />
        {errors.name && <p className="text-danger">{errors.name.message}</p>}
        <input {...register("email")} className="form-control my-2" placeholder="Email" />
        {errors.email && <p className="text-danger">{errors.email.message}</p>}
        <input {...register("password")} type="password" className="form-control my-2" placeholder="Password" />
        {errors.password && <p className="text-danger">{errors.password.message}</p>}
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