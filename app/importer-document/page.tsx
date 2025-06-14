import { ImportDocumentForm } from "@/components/import-document/import-document-form"

export default function ImportDocumentPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Importer un document</h1>
          <ImportDocumentForm />
        </div>
      </div>
    </div>
  )
}
