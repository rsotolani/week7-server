import { expressjwt } from "express-jwt";
import * as dotenv from "dotenv"

dotenv.config();

export default expressjwt({
    secret: process.env.TOKEN_SIGN_SECRET,
    algorithms: ["HS256"]
});

//quando essa requisição passar por esse middleware, será criada uma chave chamada req.auth -> payload -> email, _id, role