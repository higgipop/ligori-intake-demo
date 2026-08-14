import type { FormData, ScoreBreakdown, ScoreResult, DisqualifiedResult, Result } from "./types";

export function checkDisqualifiers(data: FormData): DisqualifiedResult | null {
  if (data.practiceArea === "other") {
    return {
      disqualified: true,
      reason: "practice-area",
      message:
        "This firm specializes in personal injury law. Based on what you've described, we may not be the right fit — but we're happy to point you in the right direction.",
    };
  }

  if (data.recency === "over-2") {
    return {
      disqualified: true,
      reason: "statute-of-limitations",
      message:
        "Florida law requires personal injury claims to be filed within two years of the incident. Based on the timeline you've described, the filing deadline may have passed. We recommend speaking with an attorney immediately to understand your options.",
    };
  }

  if (data.represented === true) {
    return {
      disqualified: true,
      reason: "represented",
      message:
        "It sounds like you're already working with an attorney. We'd recommend speaking with your current counsel directly. If you have concerns about your representation, we're happy to discuss your situation.",
    };
  }

  if (data.fault === "me") {
    return {
      disqualified: true,
      reason: "fault",
      message:
        "Personal injury cases require that another party's negligence caused your injuries. Based on what you've described, this may be difficult to pursue — but we'd still encourage you to speak with an attorney to be sure.",
    };
  }

  return null;
}

function scoreFault(fault: FormData["fault"]): number {
  switch (fault) {
    case "them": return 25;
    case "mostly-them": return 15;
    case "unclear": return 8;
    default: return 0;
  }
}

function scoreTreatment(treatment: FormData["treatment"]): number {
  switch (treatment) {
    case "same-day": return 20;
    case "within-3": return 16;
    case "within-2-weeks": return 10;
    case "over-2-weeks": return 5;
    case "none": return 1;
    default: return 0;
  }
}

function scoreSeverity(injuries: FormData["injuries"]): number {
  if (injuries.includes("broken-bones") || injuries.includes("surgery") || injuries.includes("hospitalization")) {
    return 20;
  }
  if (injuries.includes("head-injury")) return 16;
  if (injuries.includes("neck-back")) return 12;
  if (injuries.includes("emotional")) return 6;
  if (injuries.includes("minor")) return 3;
  return 0;
}

function scoreInsurance(insurance: FormData["insurance"]): number {
  switch (insurance) {
    case "confirmed": return 15;
    case "likely": return 11;
    case "uninsured-with-um": return 8;
    case "unknown": return 8;
    case "uninsured-no-um": return 2;
    default: return 0;
  }
}

function scoreCaseType(area: FormData["practiceArea"]): number {
  switch (area) {
    case "auto": return 10;
    case "wrongful-death": return 10;
    case "slip-fall": return 7;
    case "property-insurance": return 6;
    case "med-mal": return 4;
    default: return 0;
  }
}

function scoreRecency(recency: FormData["recency"]): number {
  switch (recency) {
    case "under-6": return 10;
    case "6-to-12": return 8;
    case "1-to-2": return 4;
    default: return 0;
  }
}

function getTier(total: number): ScoreResult["tier"] {
  if (total >= 80) return "strong";
  if (total >= 60) return "promising";
  if (total >= 40) return "possible";
  if (total >= 20) return "challenging";
  return "unlikely";
}

function getTierLabel(tier: ScoreResult["tier"]): string {
  switch (tier) {
    case "strong": return "Strong Case";
    case "promising": return "Promising";
    case "possible": return "Possible";
    case "challenging": return "Challenging";
    case "unlikely": return "Unlikely to Qualify";
  }
}

function getProspectMessage(tier: ScoreResult["tier"]): string {
  switch (tier) {
    case "strong":
      return "Based on what you've shared, your case shows strong indicators of value. An attorney from our team will call you shortly.";
    case "promising":
      return "Your case shows promising signs. One of our team members will reach out to discuss next steps.";
    case "possible":
      return "We'd like to learn more about your situation. Someone from our team will be in touch.";
    case "challenging":
      return "Thank you for reaching out. Your case presents some challenges, but we'd still like to speak with you.";
    case "unlikely":
      return "Thank you for sharing your information. Based on what you've described, this may be difficult to pursue — but an attorney will review your submission.";
  }
}

function getCallPriority(tier: ScoreResult["tier"]): string {
  switch (tier) {
    case "strong": return "Same-day call";
    case "promising": return "24-hour callback";
    case "possible": return "48-hour callback";
    case "challenging": return "Lower priority";
    case "unlikely": return "Auto-response only";
  }
}

export function scoreCase(data: FormData): Result {
  const disq = checkDisqualifiers(data);
  if (disq) return disq;

  const breakdown: ScoreBreakdown = {
    fault: scoreFault(data.fault),
    treatment: scoreTreatment(data.treatment),
    severity: scoreSeverity(data.injuries),
    insurance: scoreInsurance(data.insurance),
    caseType: scoreCaseType(data.practiceArea),
    recency: scoreRecency(data.recency),
  };

  const total = Math.min(
    100,
    breakdown.fault +
      breakdown.treatment +
      breakdown.severity +
      breakdown.insurance +
      breakdown.caseType +
      breakdown.recency
  );

  const tier = getTier(total);

  return {
    total,
    breakdown,
    tier,
    tierLabel: getTierLabel(tier),
    prospectMessage: getProspectMessage(tier),
    callPriority: getCallPriority(tier),
    disqualified: false,
  };
}
