import { FC } from 'react'

import { AccountLocked, AccountUnlocked } from '@/icons'

interface Props {
  isLocked: boolean
}

const AccountStatus: FC<Props> = ({ isLocked }) => {
  const text = isLocked ? 'Locked' : 'Unlocked';
  
  return (
    <div className="flex items-center gap-2">
      {isLocked ? <AccountLocked /> : <AccountUnlocked />}
      <span className="text-sm text-gray-900 dark:text-white">{text}</span>
    </div>
  )
}

export default AccountStatus