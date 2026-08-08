import BackLink from "@/components/Elements/BackLink";
import SiteFooter from "@/components/Layout/SiteFooter";

const Page = () => {
  return (
    <div className='w-full h-full flex-1 flex flex-col gap-4 p-4 md:p-8'>
      <BackLink href='/'>Menu</BackLink>

      <div className='w-full max-w-lg flex flex-col gap-4 mx-auto'>
        <div className='text-center font-semibold text-lg'>About</div>
        <div className='flex flex-col gap-2'>
          <p>Wingu Sudoku is an Open-Source ad-free Sudoku app. The goal is to create an enjoyable Sudoku app that can be used on any mobile device. Once loaded no internet connection is required to complete a puzzle. Progress is stored locally on the device.</p>
          <p>
            You can find the source code on: <a className='text-primary underline' href="https://github.com/drijnkels/sudoku">https://github.com/drijnkels/sudoku</a>, feel free to contribute, leave suggestions or create your own version.
          </p>
          <p>
            If you need more boards <a className='text-primary underline' href="https://github.com/drijnkels/python-sudoku-generator-solver">https://github.com/drijnkels/python-sudoku-generator-solver</a> can generate more boards. However some of the Hard / Insane boards generated have more than 1 solution.
          </p>
        </div>

        <SiteFooter />
      </div>
    </div>
  )
}

export default Page
