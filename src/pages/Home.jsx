import HeroBanner from "../components/home/HeroBanner";
import SectionIntro from "../components/home/SectionIntro";
import SectionSDGs from "../components/home/SectionSDGs";
import SectionCollaborations from "../components/home/SectionCollaborations";
import SectionFaculty from "../components/home/SectionFaculty";
import QuickLinks from "../components/home/QuickLinks";

export default function Home() {
  return (
    <main className='flex flex-col gap-14 md:gap-16'>
      <HeroBanner />
      <QuickLinks />
      <SectionIntro />
      <div className='px-6 md:px-24'>
        <div className='max-w-7xl mx-auto border-t-2 border-gray-300' />
      </div>
      <SectionSDGs />
      <div className='px-6 md:px-24'>
        <div className='max-w-7xl mx-auto border-t-2 border-gray-300' />
      </div>
      <SectionCollaborations />
      <div className='px-6 md:px-24'>
        <div className='max-w-7xl mx-auto border-t-2 border-gray-300' />
      </div>
      <SectionFaculty />
    </main>
  );
}
