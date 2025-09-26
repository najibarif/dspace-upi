// src/pages/Patent.jsx
import { Card, CardContent } from "../components/ui/card";

export default function Patent() {
  return (
    <section className="py-10 px-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Patents</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-lg font-semibold">Patent 1</h2>
          <CardContent>
            <p className="text-gray-600">Description of patent 1.</p>
          </CardContent>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Patent 2</h2>
          <CardContent>
            <p className="text-gray-600">Description of patent 2.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
