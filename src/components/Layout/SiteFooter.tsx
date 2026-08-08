import Image from "next/image";

/**
 * Site links and version. Deliberately not rendered on the puzzle pages — on a
 * landscape tablet this block competes with the board for vertical space.
 */
export default function SiteFooter() {
  return (
    <footer className='w-full flex flex-col items-center gap-4 mt-8 mb-4'>
      <div className='flex flex-wrap gap-8 justify-center'>
        <div>
          <div className='mb-2 text-sm text-center text-slate-500'>Find me on</div>
          <a
            style={{background: '#bec2ff'}}
            className='w-[140px] h-[45px] pt-1 flex justify-center items-center rounded-sm shadow-sm'
            rel="me"
            href="https://mastodon.social/@noctemz"
          >
            <Image alt={"Mastodon wordmark in white"} src={'/mastodon/wordmark-white-text.svg'} width={100} height={100} />
          </a>
        </div>
        <div>
          <div className='mb-2 text-sm text-center text-slate-500'>Enjoying Wingu Sudoku?</div>
          <div className='flex justify-center'>
            <a
              className='bg-primary hover:bg-primary-hover text-white h-[45px] px-3 rounded-sm shadow-sm flex items-center'
              href='https://ko-fi.com/wingu_solutions'
            >
              ☕ Buy me a coffee!
            </a>
          </div>
        </div>
      </div>
      <div className='text-sm text-center text-slate-500'>Version: {process.env.APP_VERSION}</div>
    </footer>
  )
}
