const express = require('express');
const { registerUser, authUser, allUsers } = require('../controllers/userControllers');
const auth = require('../middleware/authMiddleware');
const userRouter = express.Router();


userRouter.get("/",auth, allUsers);
userRouter.post('/register', registerUser)
userRouter.post('/login', authUser)

module.exports = userRouter;