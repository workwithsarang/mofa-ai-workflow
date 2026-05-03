const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VALID_TYPES = ['UPPERCASE', 'WORD_COUNT', 'REVERSE', 'TRIM'];
const VALID_STATUSES = ['ACTIVE', 'INACTIVE'];

async function listAgents(req, res) {
  const agents = await prisma.agent.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(agents);
}

async function createAgent(req, res) {
  const { name, type, inputSchema, processingLogic, status } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'name and type are required' });
  }
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const agent = await prisma.agent.create({
    data: {
      userId: req.userId,
      name,
      type,
      inputSchema: inputSchema || null,
      processingLogic: processingLogic || null,
      status: status || 'ACTIVE',
    },
  });

  return res.status(201).json(agent);
}

async function getAgent(req, res) {
  const agent = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  return res.json(agent);
}

async function updateAgent(req, res) {
  const existing = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) return res.status(404).json({ error: 'Agent not found' });

  const { name, type, inputSchema, processingLogic, status } = req.body;

  if (type && !VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const agent = await prisma.agent.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(inputSchema !== undefined && { inputSchema }),
      ...(processingLogic !== undefined && { processingLogic }),
      ...(status !== undefined && { status }),
    },
  });

  return res.json(agent);
}

async function deleteAgent(req, res) {
  const existing = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) return res.status(404).json({ error: 'Agent not found' });

  await prisma.agent.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Agent deleted' });
}

module.exports = { listAgents, createAgent, getAgent, updateAgent, deleteAgent };
