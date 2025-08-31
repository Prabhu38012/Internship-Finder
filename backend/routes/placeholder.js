const express = require('express');
const router = express.Router();

// @desc    Generate placeholder images
// @route   GET /api/placeholder/:width/:height
// @access  Public
router.get('/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const color = req.query.color || 'cccccc';
  const textColor = req.query.text || '333333';
  const text = req.query.text || `${width}x${height}`;

  // Create SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" 
            fill="#${textColor}" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.send(svg);
});

module.exports = router;
