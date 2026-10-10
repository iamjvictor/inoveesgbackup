import { inviteBalance, invitePackages } from "../models/mock-data";

export function getInvitesPurchaseViewModel() {
  return {
    balance: inviteBalance,
    packages: invitePackages,
    shouldPromptPurchase: inviteBalance.available <= 6,
  };
}
