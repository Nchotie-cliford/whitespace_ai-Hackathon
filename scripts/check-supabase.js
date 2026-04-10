const { config } = require("../src/config");
const { SupabaseRepository } = require("../src/data/supabaseRepository");
const { RecommendationService } = require("../src/dispatch/recommendationService");

async function main() {
  if (config.useMockData) {
    throw new Error(
      "USE_MOCK_DATA is true. Set USE_MOCK_DATA=false in .env before checking Supabase.",
    );
  }

  const repository = new SupabaseRepository(config);
  const snapshot = await repository.getHealthSnapshot();
  const service = new RecommendationService(repository);

  console.log("Supabase connection snapshot:");
  console.log(JSON.stringify(snapshot, null, 2));

  const sampleEventId = process.argv[2];
  if (sampleEventId) {
    const recommendation = await service.recommendForEvent(sampleEventId);
    console.log("Sample recommendation:");
    console.log(JSON.stringify(recommendation, null, 2));
  } else {
    console.log(
      "Tip: pass an event id to also test recommendations, for example:\n" +
        "node scripts/check-supabase.js 7ec6a421-67dc-4f39-a97b-10c6f07f6f01",
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
