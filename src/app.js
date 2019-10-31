const express = require('express');
// we don't actually need to get anything from mongoose, so no need to set variable to it
// we just want to ensure it runs so that mongoose connects to DB
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app