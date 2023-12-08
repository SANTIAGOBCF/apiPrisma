import express from "express";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import cors from "cors";

const app = express();
// Allow requests from localhost
/*const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your desired port number
  };
  */
app.use(cors());

app.use(express.json());

app.use("/api", productRoutes);
app.use("/api", orderRoutes);

app.listen(3000);
console.log("Server on port", 3000);
