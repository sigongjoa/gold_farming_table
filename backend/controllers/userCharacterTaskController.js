module.exports = (dbManager) => {
  console.debug('userCharacterTaskController: Initializing with dbManager');
  return {
    createTask: async (req, res) => {
      console.debug('createTask: Entering function');
      const { character_id, task_description, target_item_id, target_quantity } = req.body;
      console.debug(`createTask: Received data - character_id: ${character_id}, task_description: ${task_description}, target_item_id: ${target_item_id}, target_quantity: ${target_quantity}`);

      if (!character_id || !task_description) {
        console.warn('createTask: Missing required fields');
        return res.status(400).json({ message: 'Character ID and task description are required.' });
      }

      let connection;
      try {
        connection = await dbManager.getPool().getConnection();
        console.debug('createTask: Database connection obtained');
        const query = `
          INSERT INTO user_character_tasks (character_id, task_description, target_item_id, target_quantity)
          VALUES (?, ?, ?, ?)
        `;
        const [results] = await connection.execute(query, [character_id, task_description, target_item_id || null, target_quantity || 0]);
        console.debug('createTask: Task created successfully, result:', results);
        res.status(201).json({ message: 'Task created successfully', taskId: results.insertId });
      } catch (error) {
        console.error('createTask: Error creating task:', error);
        res.status(500).json({ message: 'Error creating task', error: error.message });
      } finally {
        if (connection) {
          connection.release();
          console.debug('createTask: Database connection released');
        }
      }
      console.debug('createTask: Exiting function');
    },

    getTasksByCharacterId: async (req, res) => {
      console.debug('getTasksByCharacterId: Entering function');
      const { characterId } = req.params;
      console.debug(`getTasksByCharacterId: Received characterId: ${characterId}`);

      if (!characterId) {
        console.warn('getTasksByCharacterId: Missing characterId');
        return res.status(400).json({ message: 'Character ID is required.' });
      }

      let connection;
      try {
        connection = await dbManager.getPool().getConnection();
        console.debug('getTasksByCharacterId: Database connection obtained');
        const query = `
          SELECT uct.*, i.name AS target_item_name
          FROM user_character_tasks uct
          LEFT JOIN items i ON uct.target_item_id = i.id
          WHERE uct.character_id = ?
          ORDER BY uct.created_at DESC
        `;
        const [rows] = await connection.execute(query, [characterId]);
        console.debug('getTasksByCharacterId: Fetched tasks:', rows);
        res.status(200).json(rows);
      } catch (error) {
        console.error('getTasksByCharacterId: Error fetching tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
      } finally {
        if (connection) {
          connection.release();
          console.debug('getTasksByCharacterId: Database connection released');
        }
      }
      console.debug('getTasksByCharacterId: Exiting function');
    },

    updateTask: async (req, res) => {
      console.debug('updateTask: Entering function');
      const { taskId } = req.params;
      const { task_description, target_item_id, target_quantity, current_quantity, is_completed } = req.body;
      console.debug(`updateTask: Received data - taskId: ${taskId}, task_description: ${task_description}, target_item_id: ${target_item_id}, target_quantity: ${target_quantity}, current_quantity: ${current_quantity}, is_completed: ${is_completed}`);

      if (!taskId) {
        console.warn('updateTask: Missing taskId');
        return res.status(400).json({ message: 'Task ID is required.' });
      }

      let connection;
      try {
        connection = await dbManager.getPool().getConnection();
        console.debug('updateTask: Database connection obtained');
        let updateFields = [];
        let queryParams = [];

        if (task_description !== undefined) {
          updateFields.push('task_description = ?');
          queryParams.push(task_description);
        }
        if (target_item_id !== undefined) {
          updateFields.push('target_item_id = ?');
          queryParams.push(target_item_id);
        }
        if (target_quantity !== undefined) {
          updateFields.push('target_quantity = ?');
          queryParams.push(target_quantity);
        }
        if (current_quantity !== undefined) {
          updateFields.push('current_quantity = ?');
          queryParams.push(current_quantity);
        }
        if (is_completed !== undefined) {
          updateFields.push('is_completed = ?');
          queryParams.push(is_completed);
        }

        if (updateFields.length === 0) {
          console.warn('updateTask: No fields to update');
          return res.status(400).json({ message: 'No fields to update.' });
        }

        const query = `
          UPDATE user_character_tasks
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `;
        queryParams.push(taskId);

        const [results] = await connection.execute(query, queryParams);
        console.debug('updateTask: Task updated successfully, result:', results);
        res.status(200).json({ message: 'Task updated successfully', affectedRows: results.affectedRows });
      } catch (error) {
        console.error('updateTask: Error updating task:', error);
        res.status(500).json({ message: 'Error updating task', error: error.message });
      } finally {
        if (connection) {
          connection.release();
          console.debug('updateTask: Database connection released');
        }
      }
      console.debug('updateTask: Exiting function');
    },

    deleteTask: async (req, res) => {
      console.debug('deleteTask: Entering function');
      const { taskId } = req.params;
      console.debug(`deleteTask: Received taskId: ${taskId}`);

      if (!taskId) {
        console.warn('deleteTask: Missing taskId');
        return res.status(400).json({ message: 'Task ID is required.' });
      }

      let connection;
      try {
        connection = await dbManager.getPool().getConnection();
        console.debug('deleteTask: Database connection obtained');
        const query = `
          DELETE FROM user_character_tasks
          WHERE id = ?
        `;
        const [results] = await connection.execute(query, [taskId]);
        console.debug('deleteTask: Task deleted successfully, result:', results);
        if (results.affectedRows === 0) {
          console.warn('deleteTask: No task found with ID:', taskId);
          return res.status(404).json({ message: 'Task not found.' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
      } catch (error) {
        console.error('deleteTask: Error deleting task:', error);
        res.status(500).json({ message: 'Error deleting task', error: error.message });
      } finally {
        if (connection) {
          connection.release();
          console.debug('deleteTask: Database connection released');
        }
      }
      console.debug('deleteTask: Exiting function');
    },
  };
};