// src/pages/Project.jsx
import { Card, CardContent } from "../components/ui/card";

export default function Project() {
  return (
    <section className="py-10 px-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-lg font-semibold">Project A</h2>
          <CardContent>
            <p className="text-gray-600">Details of project A.</p>
          </CardContent>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Project B</h2>
          <CardContent>
            <p className="text-gray-600">Details of project B.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
