'use client'

import { useState } from "react";
import { clearAppData } from "@/scripts/persistence";
import Button from "@/components/Form/Button";
import ConfirmDialog from "@/components/Overlay/ConfirmDialog";

const SettingsList = () => {
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearAppData = () => {
    clearAppData();
    setConfirming(false);
    setCleared(true);
  }

  return (
    <div className='w-full max-w-md flex flex-col gap-4 mx-auto'>
      <div className='text-center font-semibold text-lg'>Settings</div>

      <div className='flex flex-col gap-2 p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs'>
        <div className='font-medium'>Clear app data</div>
        <p className='text-sm text-zinc-500'>
          Removes your progress on every puzzle from this device. This cannot be undone.
        </p>
        <Button variant='danger_soft' density='touch' onClick={() => setConfirming(true)}>
          Clear app data
        </Button>
        {cleared &&
          <div aria-live='polite' className='text-sm text-center text-emerald-700'>
            All puzzle progress has been cleared.
          </div>
        }
      </div>

      {confirming &&
        <ConfirmDialog
          title='Clear all app data?'
          description='Progress on every puzzle stored on this device is deleted. This cannot be undone.'
          confirmLabel='Clear everything'
          onConfirm={handleClearAppData}
          onCancel={() => setConfirming(false)}
        />
      }
    </div>
  );
};

export default SettingsList;
