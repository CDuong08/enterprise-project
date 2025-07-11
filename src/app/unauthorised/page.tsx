import Link from "next/link";

export default function unauthorised() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-blue-500">
            <header>
                <h1 className="text-4xl font-bold mb-6">Oops!</h1>
            </header>
            <p className="text-lg">Did you try to use the tracker without logging in?</p>
            <Link href="/" className="mt-4 text-white hover:underline">
                Login in here!
            </Link>
            <Link href="/signup" className="mt-4 text-white hover:underline">
                Sign up in here!
            </Link>
        </div>
    );
}
