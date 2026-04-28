
  import { DarkModeToggle } from "../../../../shared/components/dark-mode-toggle";
  import LoginForm from "../components/LoginForm";
  import Silk from "../components/Silk";

  const Login = () => {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Silk color="#F2C1CF" speed={3} noiseIntensity={1} />

        </div>

        <div className="absolute top-4 right-4 z-30">
          <DarkModeToggle />
        </div>

        <div className="flex w-full h-full">
          <div className="w-1/2 h-full flex items-center justify-center z-20">
            <LoginForm />
          </div>

          <div className="w-1/2 h-full flex items-center justify-center z-20">
            <img
              src="/public/logo_rosarosa-01.PNG"
              className="max-w-lg "
              alt="logo"
            />
          </div>
        </div>
      </div>
    );
  };

  export default Login;
