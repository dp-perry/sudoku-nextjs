import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import LinkButton from "@/components/Elements/LinkButton";

type BackLinkProps = {
  href: string,
  children: React.ReactNode,
}

/** Consistent back navigation, sized as a real touch target rather than bare text. */
export default function BackLink({href, children}: BackLinkProps) {
  return (
    <LinkButton href={href} variant='plain' density='comfortable' fullWidth={false} className='text-slate-600'>
      <ChevronLeftIcon className='size-5' />
      {children}
    </LinkButton>
  )
}
