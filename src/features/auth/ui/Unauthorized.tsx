import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export interface UnauthorizedProps {
     code: number;
}

const Forbidden = ({ code }: UnauthorizedProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Lado de la imagen */}
      <Box
        sx={{
          flex: 1,
          backgroundImage: 'url("/401error.jpg")', // ojo: sin /public
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          bgcolor: "#f9f6f2",
        }}
      />

      {/* Lado del contenido */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 4,
          py: 6,
          textAlign: "center",
        }}
      >
        <img src="/luley_logo.png" width={500} alt="Logo" />

        <Typography
          variant="h2"
          sx={{ color: "#D69041", fontWeight: "bold", mt: 3, mb: 1 }}
        >
          401 / 403 {code === 401 || code === 403 ? "No Autorizado" : "Prohibido"}
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, color: "#555" }}>
          Acceso denegado. No tienes permisos para ver esta página.
        </Typography>

        <Button
          variant="contained"
          onClick={handleBack}
          sx={{
            fontSize: { xs: "0.95rem", sm: "1rem" },
            px: { xs: 3, sm: 5 },
            py: { xs: 1.2, sm: 1.5 },
            borderRadius: "999px",
            boxShadow: 2,
            textTransform: "none",
            bgcolor: "#D69041",
            "&:hover": {
              bgcolor: "#b6732f",
            },
          }}
        >
          Volver al Login
        </Button>
      </Box>
    </Box>
  );
};

export default Forbidden;
