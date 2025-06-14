import { CreateCourseOptions } from "@/components/create-course/create-course-options"

export default function CreateCoursePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Créer un cours à partir de</h1>
          <CreateCourseOptions />
        </div>
      </div>
    </div>
  )
}
