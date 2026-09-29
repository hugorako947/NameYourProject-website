import { SearchForm } from "@/components/SearchForm";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-10 sm:py-14">
      <SearchForm />
    </main>
  );
}