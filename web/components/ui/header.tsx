import Image from "next/image";

export function Header() {
    return (
        <header className="border-b">
            <div className="container mx-auto py-4 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Image src="/placeholder.svg?height=40&width=40" alt="Logo" width={80} height={80} className="rounded" />
                </div>
            </div>
        </header>
    );
}
