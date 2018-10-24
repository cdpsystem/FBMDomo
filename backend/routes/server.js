'use strict'

let express = require('express');


let ServerController = require('../controllers/server');
let BackupController = require('../controllers/backup');
let SkiptablesController = require('../controllers/skiptable');
let FBMDomoController = require('../controllers/fbmdomo');

let router = express.Router();

//ServerController
router.get('/home',ServerController.home);
router.post('/add-server',ServerController.addServer);
router.post('/delete-server',ServerController.delServer);
router.get('/get-servers',ServerController.getServers);
router.post('/get-server',ServerController.getServerById);
router.put('/update-server/:id',ServerController.updateServer);
router.get('/get-server-log/:id/:database',ServerController.getServerLogById);
router.get('/resume',ServerController.getResume); 
router.post('/serverinfo',ServerController.getServerInfo);


//BackupLogController
router.get('/home/backuplog',BackupController.home);
router.post('/create-backup',BackupController.createBackup);
router.post('/list-backups',BackupController.listBackups);
router.post('/add-autoserver',BackupController.addAutoBackup);
router.post('/is-autoserver',BackupController.checkIfAutoBackup);
router.post('/delete-autoserver',BackupController.delAutoBackup);

//SkiptablesController
router.get('/home/skiptable',SkiptablesController.home);
router.get('/skiptables/:serverid',SkiptablesController.getServerSkiptablesById);
router.post('/skiptables/add',SkiptablesController.addSkiptable);
router.post('/skiptables/delete/:skiptabletodelete',SkiptablesController.deleteSkiptableItem);

//FBMDomoController
router.post('/version',FBMDomoController.getVersion);
router.get('/localversion',FBMDomoController.getLocalVersion);
router.post('/fbmdomoinstall',FBMDomoController.install);
router.post('/uninstall',FBMDomoController.uninstall);

module.exports = router;