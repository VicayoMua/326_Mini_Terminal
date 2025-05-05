const fetch = require("node-fetch");
const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

// ── add these 5 lines immediately below your existing requires ──
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const FSState = sequelize.define('FSState', {
  id:   { type: DataTypes.STRING, primaryKey: true },
  data: { type: DataTypes.TEXT    }
});
// ensure the table exists
sequelize.sync();


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

// routes/terminal.js

router.get('/proxy', async (req, res) => {
    const target = req.query.url;
    if (!target) return res.status(400).json({error:'Missing ?url='});
    try {
      const upstream = await fetch(target);
      res.status(upstream.status);
  
      upstream.headers.forEach((v,k) => {
        if (k.toLowerCase() !== 'content-type') {
          res.setHeader(k, v);
        }
      });
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');

      const body = await upstream.text();
      res.send(body);
    } catch (err) {
      res.status(502).send(`Proxy error: ${err.message}`);
    }
  });
  
  

// load the saved FS‑tree from SQLite
router.get('/fs/load', async (req, res) => {
  try {
    const rec = await FSState.findByPk('terminal_file_system');
    res.json(rec ? JSON.parse(rec.data) : null);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// save the current FS‑tree into SQLite
router.post('/fs/save', async (req, res) => {
  try {
    await FSState.upsert({
      id:   'terminal_file_system',
      data: JSON.stringify(req.body)
    });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


module.exports = router;