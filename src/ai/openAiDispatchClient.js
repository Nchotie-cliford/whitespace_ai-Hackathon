const { AnthropicDispatchClient } = require("./anthropicDispatchClient");

// Backward-compatible shim while the codebase moves from OpenAI naming to Anthropic.
module.exports = {
  OpenAiDispatchClient: AnthropicDispatchClient,
};
