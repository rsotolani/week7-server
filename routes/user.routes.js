import express from "express";
import TaskModel from "../model/task.model.js";
import UserModel from "../model/user.model.js";
import bcrypt from "bcrypt";


const userRoute = express.Router();

const saltRounds = 10

userRoute.post("/sign-up", async (req, res) => {
  try {

    //capturando a senha do meu req.body
    const { password } = req.body;

    //checando se a senha Existe || se a senha passou nos pré-requisitos
    if (!password ||
        !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#!])[0-9a-zA-Z$*&@#!]{8,}$/)
    ){
      return res
        .status(400)
        .json({ msg: "Senha não tem os requisitos mínimos de segurança"})
    }

    //gerar o salt
    const salt = await bcrypt.genSalt(saltRounds); //10

    //hashear a senha
    const hashedPassword = await bcrypt.hash(password, salt);

    //criar o usuario com a senha hasheada
    const newUser = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    //deletar a propriedade passwordHash do obj
    delete user._doc.passwordHash;

    return res. status(201).json(newUser)
    
  } catch (error) {
    console.error(error);
    return res.status(500).json(error.errors)
  }
});


//rota de login
userRoute.post("/login", async (req, res) => {
  try {
    //capturando o email e o password do req.body
    const { email, password} = req.body;

    //achar o usuario no banco de dados pelo email
    const user = await UserModel.findOne({ email: email});

    //checar se o email existe no meu banco de dados
    if (!user) {
      return res.status(400).json({msg: "Usuario não cadastrado"});
    }

    //comparar a senha que o usuario enviou com o hash da senha que está no banco de dados
    //bcrypt tem um étodo chamado .compare(senha que o user enviou, senha hasheada)
    if (await bcrypt.compare(password, user.passwordHash)){
      delete user._doc.passwordHash;
      //se a comparação for true, cai dentro desse if => as senhas sao iguais
      //devolver token de acesso ao usuário

      //criar token de acesso para o usuário logado
      const token = genereteToken(user);

      return res.status(200).json({
        user: user,
        token: token,
      });
    } else {
      //as senha são diferentes!!
      return res.status(401).json({ msg: "Email ou senha inválido"})
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json(error.errors);
  }
})


//rota PROFILE
userRoute.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    
    //reqcurrentUser -> veio do middle attachCurrentUser

    return res.status(200).json(req.currentUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error.errors);
  }
});


userRoute.get("/all-users",isAuth, isAdmin, async (req, res)){
  try {
    

    return res.status().json();


  } catch (error) {
    console.error(error);
    return res.status(500).json(error.errors);
  }
}








//CREATE - MONGODB
userRoute.post("/create-user", async (req, res) => {
  try {
    const form = req.body;

    //quer criar um documento dentro da sua collection -> .create()
    const newUser = await UserModel.create(form);

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

//GET ALL USERS
// userRoute.get("/all-users", async (req, res) => {
//   try {
//     // find vazio -> todas as ocorrencias
//     // projections -> defini os campos que vão ser retornados
//     // sort() -> ordenada o retorno dos dados
//     // limit() -> define quantas ocorrencias serão retornadas
//     const users = await UserModel.find({}, { __v: 0, updatedAt: 0 })
//       .sort({
//         age: 1,
//       })
//       .limit(100);

//     return res.status(200).json(users);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(error.errors);
//   }
// });

//GET ONE USER
userRoute.get("/oneUser/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // const user = await UserModel.find({_id: id})
    const user = await UserModel.findById(id).populate("tasks");

    if (!user) {
      return res.status(400).json({ msg: " Usuário não encontrado!" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

userRoute.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(400).json({ msg: "Usuário não encontrado!" });
    }

    const users = await UserModel.find();

   //deletar TODAS as tarefas que o usuário é dono
   await TaskModel.deleteMany({ user: id })


    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

userRoute.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.errors);
  }
});

export default userRoute;

//ATIVIDADE: CRIAR UMA ROTA QUE RETORNA O BANCO DE DADOS -> ROTA -> "/all-users" verbo: GET
/* userRoute.get("/all-users", (req, res) => {
  return res.status(200).json(bancoDados);
}); */

/* //POST - create
userRoute.post("/new-user", (req, res) => {
  //console.log(req.body) // => é o CORPO da minha requisição (json)
  //console.log(req.body.name) => apenas o nome

  const form = req.body;

  bancoDados.push(form);

  return res.status(201).json(bancoDados);
}); */
//DELETE - delete a user
/* userRoute.delete("/delete/:id", (req, res) => {
  console.log(req.params.id); // req.params -> {} por isso ele pode ser DESCONTRUÍDO
  const { id } = req.params; // eu estou DESCONTRUINDO o req.params e ABRINDO o obj e acessando pelo NOME da chave

  const deleteById = bancoDados.find((user) => user.id === id);

  if (!deleteById) {
    return res.status(400).json({ msg: "Usuário não encontrado" });
  }

  console.log(deleteById);
  const index = bancoDados.indexOf(deleteById);
  console.log(index);

  bancoDados.splice(index, 1);

  return res.status(200).json(bancoDados);
}); */

//PUT - editar
/* userRoute.put("/edit/:id", (req, res) => {
  const { id } = req.params;

  const editUser = bancoDados.find((user) => user.id === id);
  const index = bancoDados.indexOf(editUser); // 0

  bancoDados[index] = {
    ...editUser,
    ...req.body,
  };

  return res.status(200).json(bancoDados[index]);
}); */
