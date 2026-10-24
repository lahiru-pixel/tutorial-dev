export default function Footer() {
  return (
    <footer className="bg-brand-purple text-white px-4 py-6 mt-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-sm">
        <p className="font-semibold">eZy Account with JB</p>
        <p className="text-white/80">© {new Date().getFullYear()} eZy Account with JB. All rights reserved.</p>
      </div>
    </footer>
  );
}
