export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-4">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-gray-500 sm:flex-row">
        <span>© {new Date().getFullYear()} Zubkas Partner Program. All rights reserved.</span>
        <span className="font-medium">
          Powered by <span className="font-display font-bold text-zubkas-700">Zubkas</span>
        </span>
      </div>
    </footer>
  );
}
