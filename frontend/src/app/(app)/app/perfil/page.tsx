import { ProfileView } from "@/features/company-area/views/pages/perfil/profile-view";
import { getProfileViewModel } from "@/features/company-area/controllers/profile.controller";

export default function PerfilPage() {
  const model = getProfileViewModel();
  return <ProfileView model={model} />;
}
