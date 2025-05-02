import SettingsList from "@/components/Settings/SettingsList";
import Link from "next/link";

const Page = () => {

  return (
    <div className='p-12 w-full h-full flex-1 flex flex-col'>
      <div className='w-full mb-4 text-slate-600'><Link href='/'>{'<-- Return to menu'}</Link></div>

      <SettingsList />
    </div>
  )
}

export default Page;