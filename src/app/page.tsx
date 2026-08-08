import { Cog6ToothIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import LinkButton from "@/components/Elements/LinkButton";
import DifficultyTile from "@/components/Layout/DifficultyTile";
import SiteFooter from "@/components/Layout/SiteFooter";
import { difficulties } from "@/lib/difficulties";

export default function Home() {
  return (
    <div className='w-full flex-1 flex flex-col p-4 md:p-8'>
      <div className='w-full max-w-3xl mx-auto flex flex-col gap-6'>
        <h1 className='text-center font-semibold text-2xl text-primary'>Pick a puzzle</h1>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
          {difficulties.map((difficulty) => (
            <DifficultyTile key={difficulty.key} difficulty={difficulty} />
          ))}
        </div>

        <div className='flex justify-center gap-3'>
          <LinkButton
            href='/settings'
            variant='secondary'
            density='comfortable'
            fullWidth={false}
            icon={<Cog6ToothIcon className='size-5' />}
          >
            Settings
          </LinkButton>
          <LinkButton
            href='/about'
            variant='secondary'
            density='comfortable'
            fullWidth={false}
            icon={<InformationCircleIcon className='size-5' />}
          >
            About
          </LinkButton>
        </div>

        <SiteFooter />
      </div>
    </div>
  )
}
