const { PrismaClient } = require('@prisma/client');
const { runAgent } = require('../helpers/runAgent');

const prisma = new PrismaClient();

async function listWorkflows(req, res) {
  const workflows = await prisma.workflow.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(workflows);
}

async function createWorkflow(req, res) {
  const { name, agentIds } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!Array.isArray(agentIds) || agentIds.length !== 2) {
    return res.status(400).json({ error: 'agentIds must be an array of exactly 2 agent IDs' });
  }

  // Verify both agents belong to the user
  for (const agentId of agentIds) {
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId: req.userId },
    });
    if (!agent) {
      return res.status(404).json({ error: `Agent ${agentId} not found` });
    }
  }

  const workflow = await prisma.workflow.create({
    data: { userId: req.userId, name, agentIds },
  });

  return res.status(201).json(workflow);
}

async function getWorkflow(req, res) {
  const workflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
  return res.json(workflow);
}

async function runWorkflow(req, res) {
  const { input } = req.body;

  if (input === undefined || input === null) {
    return res.status(400).json({ error: 'input is required' });
  }

  const workflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

  // Fetch both agents
  const [agentA, agentB] = await Promise.all([
    prisma.agent.findFirst({ where: { id: workflow.agentIds[0], userId: req.userId } }),
    prisma.agent.findFirst({ where: { id: workflow.agentIds[1], userId: req.userId } }),
  ]);

  if (!agentA) return res.status(404).json({ error: 'Agent A not found' });
  if (!agentB) return res.status(404).json({ error: 'Agent B not found' });

  const step1Output = runAgent(agentA, String(input));
  const step2Output = runAgent(agentB, step1Output);

  return res.json({
    steps: [
      { index: 1, agentId: agentA.id, agentName: agentA.name, output: step1Output },
      { index: 2, agentId: agentB.id, agentName: agentB.name, output: step2Output },
    ],
    finalOutput: step2Output,
  });
}

async function deleteWorkflow(req, res) {
  const workflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
  await prisma.workflow.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Workflow deleted' });
}

module.exports = { listWorkflows, createWorkflow, getWorkflow, runWorkflow, deleteWorkflow };
