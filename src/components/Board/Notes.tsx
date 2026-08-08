export default function Notes ({notes}: {notes:number[]}) {
  const noteDigits = [
    [1,2,3],
    [4,5,6],
    [7,8,9]
  ]
  // Spans rather than divs: this renders inside the Cell <button>, whose content model
  // only allows phrasing content. The display classes do the layout.
  return (
    <span className='absolute inset-0 text-[calc(var(--cell)*0.24)] leading-none items-center text-slate-500 text-center grid grid-rows-3'>
      {
        noteDigits.map((row, rowIndex) => (
          <span key={rowIndex} className='flex items-center'>
            {
              row.map((digit, digitIndex) => (
                <span key={digitIndex} className='flex-1'>
                  {notes.indexOf(digit) > -1 ? digit : ' '}
                </span>
              ))
            }
          </span>
        ))
      }
    </span>
  )
}
