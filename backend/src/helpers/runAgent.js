const AGENT_PROCESSORS = {
  UPPERCASE: (input) => input.toUpperCase(),

  WORD_COUNT: (input) => {
    const count = input.trim() === '' ? 0 : input.trim().split(/\s+/).length;
    return String(count);
  },

  REVERSE: (input) => input.split('').reverse().join(''),

  TRIM: (input) => input.trim(),
};

function runAgent(agent, input) {
  const processor = AGENT_PROCESSORS[agent.type];
  if (!processor) {
    throw new Error(`Unknown agent type: ${agent.type}`);
  }
  return processor(String(input));
}

module.exports = { runAgent };
