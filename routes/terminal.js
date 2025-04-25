const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

router.post('/run', (req, res) => {
    const { command } = req.body;

    // Secure, allow only ping
    if (!command || !command.startsWith('ping')) {
        return res.status(403).send('Only "ping" command is supported.');
    }

    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
        console.log('[PING DEBUG] Command:', command);
        console.log('[PING DEBUG] Error:', error);
        console.log('[PING DEBUG] stderr:', stderr);
        console.log('[PING DEBUG] stdout:', stdout);
        if (error) {
            return res.status(500).send(stderr || 'Execution error');
        }
        res.send(stdout);
    });
});

module.exports = router;
