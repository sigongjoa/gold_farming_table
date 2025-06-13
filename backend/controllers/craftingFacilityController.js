module.exports = (dbManager) => {
  console.debug('craftingFacilityController: Initializing with dbManager');

  return {
    // Get all crafting facilities with their levels for a given server
    getCraftingFacilitiesByServer: async (req, res) => {
      console.debug('getCraftingFacilitiesByServer: Entering function');
      const { serverId } = req.params; // serverId를 params에서 직접 가져옵니다.
      console.debug(`getCraftingFacilitiesByServer: Received serverId: ${serverId}`);

      if (!serverId) {
        console.warn('getCraftingFacilitiesByServer: Missing serverId');
        return res.status(400).json({ message: 'Server ID is required.' });
      }

      let connection;
      try {
        connection = await dbManager.getPool().getConnection();
        console.debug('getCraftingFacilitiesByServer: Database connection obtained');

        // 서버 ID를 이름으로 조회하는 로직을 제거하고, 받은 serverId를 직접 사용합니다.
        // 이 부분은 이미 라우트에서 serverId를 받았으므로 필요 없습니다.

        // 크래프팅 시설과 해당 서버의 레벨 및 업그레이드 정보를 가져옵니다.
        const query = `
          SELECT
            cf.id AS crafting_facility_id,
            cf.name AS crafting_facility_name,
            cf.icon_url,
            COALESCE(scf.level, 0) AS level,
            -- Level 2 upgrade details
            cu2.special_part_name AS level2_special_part_name,
            cu2.special_part_materials AS level2_special_part_materials,
            cu2.shop_part_name AS level2_shop_part_name,
            cu2.npc_location AS level2_npc_location,
            cu2.purchase_currency AS level2_purchase_currency,
            -- Level 3 upgrade details
            cu3.special_part_name AS level3_special_part_name,
            cu3.special_part_materials AS level3_special_part_materials,
            cu3.shop_part_name AS level3_shop_part_name,
            cu3.npc_location AS level3_npc_location,
            cu3.purchase_currency AS level3_purchase_currency
          FROM crafting_facilities cf
          LEFT JOIN server_crafting_facilities scf ON cf.id = scf.crafting_facility_id AND scf.server_id = ?
          LEFT JOIN crafting_facility_upgrades cu2 ON cf.id = cu2.crafting_facility_id AND cu2.upgrade_level = 2
          LEFT JOIN crafting_facility_upgrades cu3 ON cf.id = cu3.crafting_facility_id AND cu3.upgrade_level = 3
          ORDER BY cf.id ASC
        `;
        const [rows] = await connection.execute(query, [serverId]);
        console.debug('getCraftingFacilitiesByServer: Fetched crafting facilities:', rows);
        res.status(200).json(rows);
      } catch (error) {
        console.error('getCraftingFacilitiesByServer: Error fetching crafting facilities:', error);
        res.status(500).json({ message: 'Error fetching crafting facilities', error: error.message });
      } finally {
        if (connection) {
          connection.release();
          console.debug('getCraftingFacilitiesByServer: Database connection released');
        }
      }
      console.debug('getCraftingFacilitiesByServer: Exiting function');
    },

    // Update crafting facility level for a given server
    updateCraftingFacilityLevel: async (req, res) => {
      console.debug('updateCraftingFacilityLevel: Entering function');
      const { serverId, facilityId } = req.params;
      const { level } = req.body;
      console.debug(`updateCraftingFacilityLevel: Received data - serverId: ${serverId}, facilityId: ${facilityId}, level: ${level}`);

      if (!serverId || !facilityId || level === undefined) {
        console.warn('updateCraftingFacilityLevel: Missing required fields');
        return res.status(400).json({ message: 'Server ID, Facility ID, and Level are required.' });
      }

      let connection;
      try {
        connection = await dbManager.getPool().getConnection();
        console.debug('updateCraftingFacilityLevel: Database connection obtained');

        // Check if the server_crafting_facilities entry exists
        const [existing] = await connection.execute(
          'SELECT * FROM server_crafting_facilities WHERE server_id = ? AND crafting_facility_id = ?',
          [serverId, facilityId]
        );

        let query;
        let queryParams = [level, serverId, facilityId];
        if (existing.length > 0) {
          // Update existing
          console.debug('updateCraftingFacilityLevel: Updating existing facility level');
          query = `
            UPDATE server_crafting_facilities
            SET level = ?
            WHERE server_id = ? AND crafting_facility_id = ?
          `;
        } else {
          // Insert new
          console.debug('updateCraftingFacilityLevel: Inserting new facility level');
          query = `
            INSERT INTO server_crafting_facilities (level, server_id, crafting_facility_id)
            VALUES (?, ?, ?)
          `;
        }

        const [results] = await connection.execute(query, queryParams);
        console.debug('updateCraftingFacilityLevel: Facility level updated/inserted successfully, result:', results);
        res.status(200).json({ message: 'Crafting facility level updated successfully', affectedRows: results.affectedRows });
      } catch (error) {
        console.error('updateCraftingFacilityLevel: Error updating/inserting facility level:', error);
        res.status(500).json({ message: 'Error updating crafting facility level', error: error.message });
      } finally {
        if (connection) {
          connection.release();
          console.debug('updateCraftingFacilityLevel: Database connection released');
        }
      }
      console.debug('updateCraftingFacilityLevel: Exiting function');
    },
  };
}; 