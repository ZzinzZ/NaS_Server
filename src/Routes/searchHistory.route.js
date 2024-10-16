const express = require('express');
const searchHistoryController = require('../Controllers/SearchHistory.controller');


const router = express.Router();

router.delete('/:searchId', searchHistoryController.deleteSearchHistory);
router.get('/:userId', searchHistoryController.getSearchByUserId);

module.exports = router;