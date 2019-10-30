const express = require('express');
// we don't actually need to get anything from mongoose, so no need to set variable to it
// we just want to ensure it runs so that mongoose connects to DB
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log("Server running on port", port);
});

