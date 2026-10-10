import { getInvitesPurchaseViewModel } from "@/features/company-area/controllers/invites.controller";
import { InvitePurchaseView } from "@/features/company-area/views/pages/checkout/invite-purchase-view";

export default function InvitePurchasePage() {
  const model = getInvitesPurchaseViewModel();

  return <InvitePurchaseView model={model} />;
}
