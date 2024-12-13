import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import http from "http";
import mongoose from "mongoose";
import routes from "routes";
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running at port ${PORT}`));

mongoose.Promise = Promise;
if (!process.env.MONGO_URI) {
  throw new Error("MONGO URI Not found");
}
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on("error", (error: Error) => console.log(error));

app.use("/", routes());
