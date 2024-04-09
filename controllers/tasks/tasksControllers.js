const TaskModel = require('../../models/task');

// Импорт классов ошибок
const BAD_REQUEST_M = require('../../utils/responce/BAD_REQUEST');

async function getTasks(req, res, next) {
    const { deviceId } = req.params;

    try {
        const tasks = await TaskModel.find({ author: deviceId });
        res.status(200).send({ tasks });

    } catch (error) {
        next(error);
    }
}

async function createTask(req, res, next) {
    const { name, text, isImportant, isDone } = req.body;
    const { deviceId } = req.params;

    try {
        const taskObject = {
            date: new Date().toString(),
            name,
            text,
            isImportant,
            isDone,
            author: deviceId
        };

        const newTask = await TaskModel.create(taskObject);
        res.status(200).send({ task: newTask });
    } catch (error) {
        next(error);
    }
}

async function updateTask(req, res, next) {
    const { _id, name, text, isImportant, isDone } = req.body;

    try {
        let task = await TaskModel.findById(_id);

        if (!task) {
            throw new BAD_REQUEST_M('Задание не найдено')
        }

        if (name) {
            task.name = name;
        }
        if (text) {
            task.text = text;
        }
        if (isImportant !== undefined) {
            task.isImportant = isImportant;
        }
        if (isDone !== undefined) {
            task.isDone = isDone;
        }

        const updatedTask = await task.save();

        res.status(200).send({ task: updatedTask });
    } catch (error) {
        next(error);
    }
}

async function removeTask(req, res, next) {
    const { _id } = req.body;

    try {
        await TaskModel.findByIdAndRemove(_id)

        res.status(200).send({ message: "Задание успешно удалено" });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getTasks,
    createTask,
    updateTask,
    removeTask,
}