import express from "express";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import cors from "cors";

const app = express();


const corsOptions = {
  origin: ['http://localhost:4200','https://frac-angu.vercel.app/']
};
                      
// Enable CORS for localhost:4200
app.use(cors(
  corsOptions
));
app.use(express.json());

app.use("/api", productRoutes);
app.use("/api", orderRoutes);

app.listen(3000);
console.log("Server on port", 3000);
