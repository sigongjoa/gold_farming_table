const express = require('express');

module.exports = (dbManager) => {
  const router = express.Router();
  const craftingFacilityController = require('../controllers/craftingFacilityController')(dbManager);

  // Get all crafting facilities with their levels for a given server
  router.get('/servers/:serverId', craftingFacilityController.getCraftingFacilitiesByServer);

  // Update crafting facility level for a given server
  router.put('/servers/:serverId/facilities/:facilityId', craftingFacilityController.updateCraftingFacilityLevel);

  return router;
}; 