import { emptyForm } from "@/lib/mission-form";
import MissionForm from "../MissionForm";

export default function NewMissionPage() {
  return <MissionForm initialData={emptyForm} />;
}
