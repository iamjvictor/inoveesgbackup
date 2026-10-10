import { companyProfile, inviteBalance } from "../models/mock-data";

export function getProfileViewModel() {
  return {
    companyProfile,
    inviteBalance,
    billingHistory: [
      { id: "inv-003", date: "12/12/2025", amount: "R$ 450,00", status: "pago" },
      { id: "inv-002", date: "12/11/2025", amount: "R$ 450,00", status: "pago" },
      { id: "inv-001", date: "12/10/2025", amount: "R$ 450,00", status: "pago" },
    ],
    nextBilling: {
      date: "12/01/2026",
      amount: "R$ 450,00",
    }
  };
}
