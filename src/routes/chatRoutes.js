const express = require('express');
const auth = require('../middleware/authMiddleware');
const { accessChat, fetchChat, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chatControllers');

const chatRouter = express.Router();

chatRouter.post('/',auth,accessChat)
chatRouter.get('/', auth, fetchChat)
chatRouter.post('/group', auth, createGroupChat)
chatRouter.put('/rename', auth, renameGroup);
chatRouter.put('/group-add', addToGroup);
chatRouter.put('/group-remove', removeFromGroup);

module.exports = chatRouter