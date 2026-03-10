import InvoiceForm from "@/components/invoice-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function GeneratorPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12 flex justify-between items-end">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-indigo-600 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Invoice Generator</h1>
          <p className="text-neutral-500 max-w-xl">
            Fill out the details below to create a professional invoice. Use AI suggestions to speed up the process.
          </p>
        </div>
      </div>

      <InvoiceForm />
    </div>
  );
}
