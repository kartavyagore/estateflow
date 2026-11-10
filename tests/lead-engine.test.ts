import { selectAssignee, AssigneeCandidate } from "../lib/lead-engine/assignment";

export async function testLeadEngine() {
  console.log("▶ Testing Lead Auto-Assignment Engine & Quota Limits...");

  const candidates: AssigneeCandidate[] = [
    {
      id: "agent_1",
      userId: "u1",
      name: "Agent Alice",
      email: "alice@builder.com",
      role: "SALESPERSON",
      capacity: 10,
      isAvailable: true,
      activeLeadCount: 5,
      lastAssignedAt: new Date("2026-01-01T10:00:00Z"),
    },
    {
      id: "agent_2",
      userId: "u2",
      name: "Agent Bob",
      email: "bob@builder.com",
      role: "SALESPERSON",
      capacity: 10,
      isAvailable: true,
      activeLeadCount: 2,
      lastAssignedAt: new Date("2026-01-01T12:00:00Z"),
    },
  ];

  // 1. Round-Robin should choose Agent Alice (assigned longest ago)
  const roundRobinDecision = selectAssignee(candidates, "ROUND_ROBIN");
  if (!roundRobinDecision.isSuccessful || roundRobinDecision.assignedMemberId !== "agent_1") {
    throw new Error(`Round-robin expected agent_1, got ${roundRobinDecision.assignedMemberId}`);
  }

  // 2. Least-Active should choose Agent Bob (activeLeadCount: 2 vs 5)
  const leastActiveDecision = selectAssignee(candidates, "LEAST_ACTIVE");
  if (!leastActiveDecision.isSuccessful || leastActiveDecision.assignedMemberId !== "agent_2") {
    throw new Error(`Least-active expected agent_2, got ${leastActiveDecision.assignedMemberId}`);
  }

  // 3. Capacity overflow fallback queue test
  const fullCandidates: AssigneeCandidate[] = [
    {
      id: "agent_full",
      userId: "u3",
      name: "Agent Full",
      email: "full@builder.com",
      role: "SALESPERSON",
      capacity: 5,
      isAvailable: true,
      activeLeadCount: 5, // Full
    },
  ];

  const overflowDecision = selectAssignee(fullCandidates, "ROUND_ROBIN");
  if (overflowDecision.isSuccessful || overflowDecision.assignedMemberId !== null) {
    throw new Error("Capacity overflow was not routed to fallback queue!");
  }

  console.log("  ✔ Round-robin lead distribution verified");
  console.log("  ✔ Least-active capacity balancing verified");
  console.log("  ✔ Unassigned fallback queue routing on capacity overflow verified");
}

