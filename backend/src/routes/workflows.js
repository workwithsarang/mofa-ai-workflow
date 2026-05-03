const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  listWorkflows,
  createWorkflow,
  getWorkflow,
  runWorkflow,
} = require('../controllers/workflowController');

router.use(authMiddleware);

/**
 * @swagger
 * /workflows:
 *   get:
 *     summary: List all workflows for the authenticated user
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of workflows
 */
router.get('/', listWorkflows);

/**
 * @swagger
 * /workflows:
 *   post:
 *     summary: Create a new workflow (exactly 2 agents)
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, agentIds]
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Workflow
 *               agentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 2
 *                 maxItems: 2
 *                 example: ["agentAId", "agentBId"]
 *     responses:
 *       201:
 *         description: Workflow created
 *       400:
 *         description: Validation error
 *       404:
 *         description: Agent not found
 */
router.post('/', createWorkflow);

/**
 * @swagger
 * /workflows/{id}:
 *   get:
 *     summary: Get a single workflow by ID
 *     tags: [Workflows]
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
 *         description: Workflow object
 *       404:
 *         description: Workflow not found
 */
router.get('/:id', getWorkflow);

/**
 * @swagger
 * /workflows/{id}/run:
 *   post:
 *     summary: Execute a workflow with an input string
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [input]
 *             properties:
 *               input:
 *                 type: string
 *                 example: hello world
 *     responses:
 *       200:
 *         description: Step-by-step execution result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 steps:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       index:
 *                         type: integer
 *                       agentId:
 *                         type: string
 *                       agentName:
 *                         type: string
 *                       output:
 *                         type: string
 *                 finalOutput:
 *                   type: string
 *       404:
 *         description: Workflow or agent not found
 */
router.post('/:id/run', runWorkflow);

module.exports = router;
