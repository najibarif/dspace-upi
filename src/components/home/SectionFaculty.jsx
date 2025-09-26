const faculties = [
  {
    name: "FPMIPA",
    items: ["Matematika", "Fisika", "Kimia", "Ilmu Komputer"],
  },
  {
    name: "FPTK",
    items: [
      "Teknik Elektro",
      "Teknik Mesin",
      "Teknik Sipil",
      "Pendidikan Teknologi",
    ],
  },
  {
    name: "FPBS",
    items: [
      "Bahasa Indonesia",
      "Bahasa Inggris",
      "Bahasa Jepang",
      "Bahasa Arab",
    ],
  },
  { name: "FPOK", items: ["Ilmu Keolahragaan", "PJKR", "PKO", "Gizi"] },
  {
    name: "FIP",
    items: [
      "Administrasi Pendidikan",
      "Psikologi Pendidikan",
      "Teknologi Pendidikan",
      "Pendidikan Masyarakat",
    ],
  },
  {
    name: "FPEB",
    items: ["Manajemen", "Akuntansi", "Ekonomi", "Ekonomi Syariah"],
  },
  { name: "FPSD", items: ["Seni Rupa", "Seni Musik", "DKV"] },
  {
    name: "FPIPS",
    items: ["Pendidikan Sejarah", "SPIG", "Pendidikan IPS"],
  },
];

export default function SectionFaculty() {
  return (
    <section className='px-6 md:px-24 pb-16'>
      <div className='max-w-7xl mx-auto'>
        <h3 className='text-xl md:text-2xl font-semibold text-gray-900 mb-3'>
          Faculty
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 text-sm md:text-base text-gray-800'>
          {faculties.map((f) => (
            <div key={f.name} className='space-y-3'>
              <div className='font-semibold'>{f.name}</div>
              {f.items.slice(0, 5).map((item, i) => (
                <div key={i} className='text-gray-600'>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
