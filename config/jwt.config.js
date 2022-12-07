import jwt  from "jsonwebtoken";

function generateToken(user) {

    //user -> é o usuário para quem eu vou criar esse token
    //user -> que vem do seu banco de dados

    const { _id, email, role } = user;

    //signature -> a assinatura que prova que foi essa aplicacao que criou o token
    const signature = process.env.TOKEN_SIGN_SECRET;

    //experiation define por quanto tempo o token será válido
    const expiration = "12h";

    //essa funçao vai retorna o token assinado.
    //argumentos da função sign()
    //1º Payload -> quais as informacoes que vamos guardar DENTRO do token
    return jwt.sign({_id, email, role }, signature, {expiresIn: expiration })

}

export default generateToken