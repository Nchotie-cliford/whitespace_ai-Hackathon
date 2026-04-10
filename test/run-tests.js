const assert = require("node:assert/strict");
const { MockRepository } = require("../src/data/mockRepository");
const { RecommendationService } = require("../src/dispatch/recommendationService");
const {
  testStrongBaselineBeatsVagueManualReview,
  testDailyBriefGetsDailyDisplay,
  testArrivalBriefGetsArrivalDisplay,
  testHandoverSummaryGetsHandoverDisplay,
} = require("./dispatchAiService.test");

async function testTrafficDelayRecommendation() {
  const service = new RecommendationService(new MockRepository());
  const result = await service.recommendForEvent(
    "7ec6a421-67dc-4f39-a97b-10c6f07f6f01",
  );

  assert.equal(result.suggestedAction, "reassign");
  assert.equal(result.heroTaskId, 6016);
  assert.equal(result.suggestedUserName, "Jan Reiter");
  assert.ok(result.confidence >= 0.8);
}

async function testWeatherDelayRecommendation() {
  const service = new RecommendationService(new MockRepository());
  const result = await service.recommendForEvent(
    "7ec6a421-67dc-4f39-a97b-10c6f07f6f03",
  );

  assert.equal(result.suggestedAction, "delay");
  assert.equal(result.heroTaskId, 6014);
  assert.equal(result.suggestedUserName, "Mehmet Oezkan");
  assert.ok(result.reason.includes("Weather-related safety blocker"));
}

async function main() {
  const tests = [
    ["traffic delay recommendation", testTrafficDelayRecommendation],
    ["weather delay recommendation", testWeatherDelayRecommendation],
    ["ai service keeps strong grounded fallback", testStrongBaselineBeatsVagueManualReview],
    ["daily brief gets daily display", testDailyBriefGetsDailyDisplay],
    ["arrival brief gets arrival display", testArrivalBriefGetsArrivalDisplay],
    ["handover summary gets handover display", testHandoverSummaryGetsHandoverDisplay],
  ];

  for (const [name, run] of tests) {
    await run();
    console.log(`PASS ${name}`);
  }
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
