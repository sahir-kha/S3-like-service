// routes/objects.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const fs = require('fs');
const path = require('path');

/**
 * @swagger
 * /objects/{objectId}:
 *   get:
 *     summary: Get an object by ID
 *     parameters:
 *       - in: path
 *         name: objectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the object to retrieve
 *     responses:
 *       200:
 *         description: Object retrieved successfully
 *       404:
 *         description: Object not found
 */

router.get('/:objectId', async (req, res) => {
  const { objectId } = req.params;
  try {
    const [rows] = await pool.query('SELECT object_name, file_path FROM objects WHERE object_name = ?', [objectId]);
    if (rows.length > 0) {
      const fileName = rows[0].object_name;
      let filePath = rows[0].file_path;

      // Remove the leading "routes/" from filePath if it exists
      if (filePath.startsWith('routes/')) {
        filePath = filePath.substring('routes/'.length);
      }
      // Construct the absolute path
      const absolutePath = path.resolve(__dirname, '..', filePath);

      // Set the response headers
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      // Create a read stream from the file
      const readStream = fs.createReadStream(absolutePath);

      // Pipe the read stream to the response
      readStream.pipe(res);
    } else {
      res.status(404).json({ error: 'Object not found' });
    }
  } catch (error) {
    console.error('Error getting object:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
