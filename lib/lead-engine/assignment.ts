export interface AssigneeCandidate {
  id: string; // OrganizationMembership.id
  userId: string;
  name: string;
  email: string;
  role: string;
  capacity: number;
  isAvailable: boolean;
  activeLeadCount: number;
  lastAssignedAt?: Date | null;
}

export type AssignmentStrategy = "ROUND_ROBIN" | "LEAST_ACTIVE" | "MANUAL";

export interface AssignmentDecision {
  assignedMemberId: string | null;
  reason: string;
  isSuccessful: boolean;
  failureReason?: string;
}

/**
 * Lead Assignment Engine
 * Dispatches incoming leads (from Meta, Web, or Manual) to eligible sales members.
 */
export function selectAssignee(
  candidates: AssigneeCandidate[],
  strategy: AssignmentStrategy = "ROUND_ROBIN"
): AssignmentDecision {
  // 1. Filter candidates who are available and not exceeding capacity
  const eligible = candidates.filter(
    (c) => c.isAvailable && c.activeLeadCount < c.capacity
  );

  if (eligible.length === 0) {
    return {
      assignedMemberId: null,
      reason: "FALLBACK_QUEUE",
      isSuccessful: false,
      failureReason: "No available sales team members with remaining lead capacity. Placed in unassigned queue.",
    };
  }

  if (strategy === "LEAST_ACTIVE") {
    // Sort by active leads ascending, tie-breaker: least recently assigned
    const sorted = [...eligible].sort((a, b) => {
      if (a.activeLeadCount !== b.activeLeadCount) {
        return a.activeLeadCount - b.activeLeadCount;
      }
      const timeA = a.lastAssignedAt ? new Date(a.lastAssignedAt).getTime() : 0;
      const timeB = b.lastAssignedAt ? new Date(b.lastAssignedAt).getTime() : 0;
      return timeA - timeB;
    });

    const selected = sorted[0];
    return {
      assignedMemberId: selected.id,
      reason: "LEAST_ACTIVE",
      isSuccessful: true,
    };
  }

  // Default: ROUND_ROBIN
  // Candidate who hasn't been assigned the longest
  const sorted = [...eligible].sort((a, b) => {
    const timeA = a.lastAssignedAt ? new Date(a.lastAssignedAt).getTime() : 0;
    const timeB = b.lastAssignedAt ? new Date(b.lastAssignedAt).getTime() : 0;
    return timeA - timeB;
  });

  const selected = sorted[0];
  return {
    assignedMemberId: selected.id,
    reason: "ROUND_ROBIN",
    isSuccessful: true,
  };
}

