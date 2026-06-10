
  import { DarkModeToggle } from "../../../../shared/components/dark-mode-toggle";
  import LoginForm from "../components/LoginForm";
  import Silk from "../components/Silk";

  const Login = () => {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10">
      <Silk color="#B2967D" speed={3} noiseIntensity={0.75} />

        </div>

        <div className="absolute top-4 right-4 z-30">
          <DarkModeToggle />
        </div>

        <div className="flex flex-col md:flex-row w-full h-full">
          <div className="w-full md:w-1/2 h-auto md:h-full flex items-center justify-center z-20">
            <LoginForm />
          </div>

          <div className="hidden md:flex w-full md:w-1/2 h-full flex-col items-center justify-center z-20">
            <img
              src="/logo_nuevo.png"
              className="max-w-lg"
              alt="logo"
            />
          </div>
        </div>
      </div>
    );
  };

  export default Login;
