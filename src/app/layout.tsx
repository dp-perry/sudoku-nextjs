import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import {Suspense} from "react";
import {Loading} from "@/components/Loading";
import Script from "next/script";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Wingu Sudoku',
  description: 'Simple ad free Sudoku app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} w-full h-full flex flex-col bg-slate-100`}>
        <header className='text-2xl font-bold text-white p-4 text-center bg-blue-600 z-20'>
          <a href="/">Wingu Sudoku</a>
        </header>
        <main className="flex-1 flex flex-col items-center w-full max-w-screen-lg mx-auto z-20">
          <div className='flex-1 w-full'>
            <Suspense fallback={<Loading/>}>
              {children}
            </Suspense>
          </div>
          <div className='flex gap-8 justify-center mb-4'>
            <div>
              <div className='mb-2 text-sm text-center mx-auto text-slate-500'>
                Find me on<br/>
              </div>
              <a
                style={{background: '#bec2ff'}}
                className='w-[140px] h-[45px] pt-1 flex justify-center items-center rounded shadow'
                rel="me"
                href="https://mastodon.social/@noctemz"
              >
                <img src={'/mastodon/wordmark-white-text.svg'} width={100}/>
              </a>
            </div>
            <div>
              <div className='mb-2 text-sm text-center mx-auto text-slate-500'>Enjoying Wingu Sudoku?</div>
              <div className='flex justify-center'>
                <a className='bg-blue-500 text-white py-2.5 px-2 rounded shadow' href='https://ko-fi.com/wingu_solutions'>☕ Buy me a
                  coffee!</a>
              </div>
            </div>
          </div>
          <div className='mb-4 text-sm text-center mx-auto text-slate-500'>Version: 0.9.8</div>
        </main>
      </body>
      <Script
        async
        defer
        src="https://umami.dapa.app/script.js"
        data-website-id="38da4290-814c-4d13-ad1d-2a04ae9dd728"
      />
    </html>
  )
}
