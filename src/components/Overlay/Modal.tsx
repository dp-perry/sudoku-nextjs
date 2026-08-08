import {ReactNode} from "react";
import { XMarkIcon } from "@heroicons/react/16/solid";
import Typography from "@/components/Text/Typography";
import Blanket from "@/components/Overlay/Blanket";

type ModalProps = {
  title?: string,
  size?: 'sm' | 'md' | 'lg' | 'full'
  canClose?: boolean
  onClose: () => void;
  children: ReactNode
}

const sizeClasses = {
  'sm': 'w-full max-w-md',
  'md': 'w-[500px]',
  'lg': 'md:w-[750px] w-full',
  'full': 'w-full'
};

const Modal = ({ title, size = 'md', canClose = true, onClose, children }: ModalProps) => {
  const classes = `${sizeClasses[size]} flex flex-col max-h-full my-4 bg-white rounded-t-xl md:rounded-xl shadow-2xl shadow-zinc-950/50 border border-zinc-200 overflow-hidden`;
  return (
    <Blanket onClickOutside={onClose}>
      <div className={classes} role='dialog' aria-modal='true'>
        {
          title &&
          <div
            className='border-b border-zinc-200 w-full pl-4 pr-2 py-2 text-left text-lg p-6 font-medium flex items-center justify-between'>
            <Typography variant='h3'>{title}</Typography>
            {canClose &&
            <button
              onClick={onClose}
              className="h-[36px] w-[36px] hover:bg-zinc-100 rounded-md flex items-center justify-center cursor-pointer"
            >
              <XMarkIcon className="w-6 h-6 opacity-70"/>
            </button>
            }
          </div>
        }
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </Blanket>
  )
}

export default Modal;