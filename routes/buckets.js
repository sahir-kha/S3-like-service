// routes/buckets.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'routes/uploads/'); // Specify the correct relative path to the uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename for uploaded files
  }
});
const upload = multer({ storage: storage });

/**
 * @swagger
 * /buckets:
 *   get:
 *     summary: List all buckets
 *     responses:
 *       200:
 *         description: A list of buckets
 *         schema:
 *           type: object
 *           properties:
 *             buckets:
 *               type: array
 *               items:
 *                 type: string
 *
 * /buckets/{bucketId}/objects/{objectName}:
 *   delete:
 *     summary: Delete an object from a bucket
 *     description: Deletes a specified object from a specified bucket.
 *     parameters:
 *       - name: bucketId
 *         in: path
 *         description: ID of the bucket containing the object(folder name )
 *         required: true
 *         type: string
 *       - name: objectName
 *         in: path
 *         description: Name of the object to delete(file name)
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: Object not found
 *       500:
 *         description: Internal server error
 */



  
  router.post('/:bucketId/objects', upload.single('file'), async (req, res) => {
    const { bucketId } = req.params;
    const fileName = req.file.originalname;
    const filePath = req.file.path;
    const bucketName = bucketId;
  
    try {
      // Check if the bucket already exists in the database
      let [rows] = await pool.query('SELECT id FROM buckets WHERE bucketName = ?', [bucketName]);
      let bucketId;
  
      if (rows.length > 0) {
        // If the bucket already exists, extract its ID
        bucketId = rows[0].id;
      } else {
        // If the bucket doesn't exist, insert a new bucket into the database
        const [result] = await pool.query('INSERT INTO buckets (bucketName) VALUES (?)', [bucketName]);
        bucketId = result.insertId;
      }
  
      // Save object metadata to the database
      const [result] = await pool.query('INSERT INTO objects (bucket_id, object_name, file_path) VALUES (?, ?, ?)', [bucketId, fileName, filePath]);
      res.status(201).json({ message: 'Object uploaded successfully', objectId: result.insertId });
    } catch (error) {
      console.error('Error saving object metadata:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT bucketName FROM buckets');
    const bucketNames = rows.map(row => row.bucketName);
    res.json({ buckets: bucketNames });
  } catch (error) {
    console.error('Error listing buckets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:bucketId/objects/:objectName', async (req, res) => {
    const { bucketId, objectName } = req.params;
   console.log(bucketId)
    try {
      // Fetch the bucket ID from the database using bucketName
      const [bucketRows] = await pool.query('SELECT id FROM buckets WHERE bucketName = ?', [bucketId]);
      console.log(bucketRows)
      // Check if the bucket exists
      if (bucketRows.length === 0) {
        return res.status(404).json({ error: 'Bucket not found' });
      }
  
      const bucketidInDB = bucketRows[0].id;
  
      // Fetch file path from the database using bucketId and objectName
      const [objectRows] = await pool.query('SELECT file_path FROM objects WHERE bucket_id = ? AND object_name = ?', [bucketidInDB, objectName]);
      console.log(objectRows)
      // Check if the object exists
      if (objectRows.length === 0) {
        return res.status(404).json({ error: 'Object not found' });
      }
  
      const filePath = objectRows[0].file_path;
  
      // Delete the file from disk
      fs.unlink(filePath, async (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        // Delete the record from the database
        await pool.query('DELETE FROM objects WHERE bucket_id = ? AND object_name = ?', [bucketidInDB, objectName]);
        
        res.json({ message: 'File deleted successfully' });
      });
    } catch (error) {
      console.error('Error deleting object:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;
