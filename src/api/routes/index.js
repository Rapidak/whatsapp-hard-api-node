const express = require('express');
const router = express.Router();
const instanceRoutes = require('./instance.route');
const messageRoutes = require('./message.route');
const miscRoutes = require('./misc.route');
const groupRoutes = require('./group.route');
const managerRoutes = require('./manager.route');
const { checkCookies } = require('../middlewares/checkCookies');
const { redirectByRole } = require('../controllers/manager.controller');

router.get('/status', (req, res) => res.send('OK'));
router.use('/instance', instanceRoutes);
router.use('/message', messageRoutes);
router.use('/group', groupRoutes);
router.use('/misc', miscRoutes);
router.get('/', checkCookies, redirectByRole);
router.use('/manager', managerRoutes); // Adiciona as rotas de gerenciamento aqui

module.exports = router;
