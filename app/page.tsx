import Image from "next/image";
import Link from "next/link";

export default function Home() {
  console.log("Home component rendered!!");
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-4xl font-bold">Hello World!</h1>
      <br />
      <Link href="/about">About</Link>
    </div>
  );
}
