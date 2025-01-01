const express = require('express');
const auth = require('../middleware/authMiddleware');
const { sendMessage, allMessages } = require('../controllers/messageControllers');
const messageRouter = express.Router();

messageRouter.post('/', auth, sendMessage);
messageRouter.get('/:chatId',auth,allMessages)


module.exports = messageRouter