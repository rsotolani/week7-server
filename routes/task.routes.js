import express from "express";
import TaskModel from "../model/task.model.js";
import UserModel from "../model/user.model.js";

const taskRoute = express.Router();

taskRoute.post("/create-task/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;

    const newTask = await TaskModel.create({ ...req.body, user: idUser });

    const userUpdated = await UserModel.findByIdAndUpdate(
      idUser,
      {
        $push: {
          tasks: newTask._id,
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(201).json(newTask);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.errors);
  }
});

taskRoute.get("/oneTask/:idTask", async (req, res) => {
  try {
    const { idTask } = req.params;

    const oneTask = await TaskModel.findById(idTask).populate("user");

    return res.status(200).json(oneTask);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.errors);
  }
});

//all-tasks
taskRoute.get("/all-tasks", async (req, res) => {
  try {
    const allTasks = await TaskModel.find({}).populate("user");

    return res.status(200).json(allTasks);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.errors);
  }
});

//update-task
taskRoute.put("/edit/:idTask", async (req, res) => {
  try {
    const { idTask } = req.params;

    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: idTask },
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.errors);
  }
});

//delete-task

taskRoute.delete("/delete/:idTask", async (req, res) => {
  try {
    const { idTask } = req.params;

    //deletei a tarefa
    const deletedTask = await TaskModel.findByIdAndDelete(idTask);

    //retirei o id da tarega de dentro da minha array TASKS
    await UserModel.findByIdAndUpdate(
      deletedTask.user,
      {
        $pull: {
          tasks: idTask,
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json(deletedTask)
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.errors);
  }
});

export default taskRoute;
