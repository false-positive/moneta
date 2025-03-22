import SkillTree from "@/components/skill-tree";

export default function TestPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6">Simulation</h1>
			<div className="h-[800px]">
				<SkillTree />
			</div>
		</div>
	);
}
