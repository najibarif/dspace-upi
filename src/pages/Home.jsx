import HeroBanner from "../components/home/HeroBanner";
import SectionIntro from "../components/home/SectionIntro";
import SectionSDGs from "../components/home/SectionSDGs";
import SectionFaculty from "../components/home/SectionFaculty";

export default function Home() {
  return (
    <main className='flex flex-col gap-14 md:gap-16'>
      <HeroBanner />
      <SectionIntro />
      <SectionSDGs />
      <SectionFaculty />
    </main>
  );
}
