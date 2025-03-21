import { CaseCards } from "@/components/ui/case-cards";
import { Header } from "@/components/ui/header";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="container mx-auto py-10 px-10 flex-1">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Cases</h1>
                    <CaseCards />
                </div>
            </main>
        </div>
    );
}
