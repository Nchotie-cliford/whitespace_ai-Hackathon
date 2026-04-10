function normalizeSkills(skills) {
  if (!skills) {
    return [];
  }

  if (Array.isArray(skills)) {
    return skills;
  }

  if (typeof skills === "string") {
    try {
      const parsed = JSON.parse(skills);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function determinePreferredZone(projectType) {
  switch (projectType) {
    case "solar":
      return "south";
    case "hvac":
      return "west";
    case "electrical":
    default:
      return "east";
  }
}

function calculateCandidateScore({
  candidate,
  requiredSkills,
  preferredZone,
  openTaskCount,
}) {
  const candidateSkills = normalizeSkills(candidate.skills);
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(skill));
  const exactSkillMatch =
    requiredSkills.length > 0 && matchedSkills.length === requiredSkills.length ? 1 : 0;
  const partialSkillMatch =
    requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 0.5;
  const hasCoreTradeSkill =
    candidateSkills.includes("electrical") ||
    candidateSkills.includes("solar") ||
    candidateSkills.includes("hvac")
      ? 1
      : 0;
  const zoneMatch = candidate.geographic_zone === preferredZone ? 1 : 0;
  const workloadScore = Math.max(0, 1 - openTaskCount / 6);

  const score =
    exactSkillMatch * 0.45 +
    partialSkillMatch * 0.25 +
    hasCoreTradeSkill * 0.1 +
    zoneMatch * 0.1 +
    workloadScore * 0.1;

  return {
    score,
    breakdown: {
      exactSkillMatch,
      partialSkillMatch,
      hasCoreTradeSkill,
      zoneMatch,
      workloadScore,
      matchedSkills,
    },
  };
}

module.exports = {
  calculateCandidateScore,
  determinePreferredZone,
};
