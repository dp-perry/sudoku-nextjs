import SettingsList from "@/components/Settings/SettingsList";
import BackLink from "@/components/Elements/BackLink";
import SiteFooter from "@/components/Layout/SiteFooter";

const Page = () => {

  return (
    <div className='w-full h-full flex-1 flex flex-col gap-4 p-4 md:p-8'>
      <BackLink href='/'>Menu</BackLink>

      <SettingsList />

      <SiteFooter />
    </div>
  )
}

export default Page;
