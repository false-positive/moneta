import { ActionTemplateTree } from "@/components/action-template-tree";
import { TutorialDialogContent, TutorialSpot } from "@/components/tutorial";

export default function TestPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6">
				What is the best financial choice in your opinion?
			</h1>
			<div className="h-[800px]">
				<ActionTemplateTree />
			</div>
			<TutorialSpot marker={{ kind: "welcome-dialog" }}>
				<TutorialDialogContent />
			</TutorialSpot>
		</div>
	);
}
