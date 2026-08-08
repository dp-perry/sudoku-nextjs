'use client'

import Modal from "@/components/Overlay/Modal";
import Button from "@/components/Form/Button";
import { ButtonVariant } from "@/components/Form/Button";

type ConfirmDialogProps = {
  title: string,
  description: string,
  confirmLabel?: string,
  cancelLabel?: string,
  confirmVariant?: ButtonVariant,
  onConfirm: () => void,
  onCancel: () => void,
}

/**
 * Small confirmation step for actions that cannot be undone, so a stray tap on a
 * tablet cannot wipe a puzzle. Renders nothing until the parent mounts it.
 */
export default function ConfirmDialog(
  {title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', confirmVariant = 'danger', onConfirm, onCancel}: ConfirmDialogProps
) {
  return (
    <Modal title={title} size='sm' onClose={onCancel}>
      <div className='flex flex-col gap-6'>
        <p className='text-zinc-700'>{description}</p>
        <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3'>
          <Button variant='secondary' density='touch' size='fit' onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} density='touch' size='fit' onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
