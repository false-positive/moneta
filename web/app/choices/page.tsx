import SkillTree from "@/components/skill-tree";
import { TutorialDialog, TutorialSpot } from "@/components/tutorial";

export default function TestPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6">
				What is the best financial choice in your opinion?
			</h1>
			<div className="h-[800px]">
				<SkillTree />
			</div>
			<TutorialSpot marker={{ kind: "welcome-dialog" }}>
				<TutorialDialog />
			</TutorialSpot>
		</div>
	);
}
