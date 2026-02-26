import express from "express";
import cors from "cors";

const app = express();
const PORT = 4242;

app.use(cors());
app.use(express.json());

// 🔹 Simulação de criação de pagamento PaySuite
app.post("/create-paysuite-session", (req, res) => {
  const { houseId, startDate, endDate, guests, totalPrice } = req.body;

  console.log("Nova reserva recebida:");
  console.log({
    houseId,
    startDate,
    endDate,
    guests,
    totalPrice,
  });

  // 🔹 Aqui futuramente vai integração real com PaySuite
  // Agora apenas simulamos URL de redirecionamento

  const fakePaymentUrl = `http://localhost:5174/payment-success?ref=${Date.now()}`;

  res.json({
    paymentUrl: fakePaymentUrl,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor PaySuite mock a correr em http://localhost:${PORT}`);
});