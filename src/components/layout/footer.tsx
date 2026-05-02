import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              Mentora
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Built for Indian BTech, BCA &amp; MCA students. Free and open source.
          </p>
        </div>
      </div>
    </footer>
  );
}
