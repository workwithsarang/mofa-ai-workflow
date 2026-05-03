const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  listAgents,
  createAgent,
  getAgent,
  updateAgent,
  deleteAgent,
} = require('../controllers/agentController');

router.use(authMiddleware);

/**
 * @swagger
 * /agents:
 *   get:
 *     summary: List all agents for the authenticated user
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of agents
 *       401:
 *         description: No token provided
 *       403:
 *         description: Invalid or expired token
 */
router.get('/', listAgents);

/**
 * @swagger
 * /agents:
 *   post:
 *     summary: Create a new agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Uppercase Agent
 *               type:
 *                 type: string
 *                 enum: [UPPERCASE, WORD_COUNT, REVERSE, TRIM]
 *               inputSchema:
 *                 type: string
 *               processingLogic:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       201:
 *         description: Agent created
 *       400:
 *         description: Validation error
 */
router.post('/', createAgent);

/**
 * @swagger
 * /agents/{id}:
 *   get:
 *     summary: Get a single agent by ID
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent object
 *       404:
 *         description: Agent not found
 */
router.get('/:id', getAgent);

/**
 * @swagger
 * /agents/{id}:
 *   put:
 *     summary: Update an agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [UPPERCASE, WORD_COUNT, REVERSE, TRIM]
 *               inputSchema:
 *                 type: string
 *               processingLogic:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Updated agent
 *       404:
 *         description: Agent not found
 */
router.put('/:id', updateAgent);

/**
 * @swagger
 * /agents/{id}:
 *   delete:
 *     summary: Delete an agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent deleted
 *       404:
 *         description: Agent not found
 */
router.delete('/:id', deleteAgent);

module.exports = router;
