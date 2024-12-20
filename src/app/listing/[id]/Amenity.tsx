import {
  AirVent,
  CarIcon,
  CheckIcon,
  CookingPot,
  Heater,
  Tv2,
  WashingMachine,
  Waves,
  WifiIcon,
} from 'lucide-react';

import { amenitiesList } from '@/shared/ameneties';

const amenitiesToIcons: Record<
  (typeof amenitiesList)[number],
  typeof WifiIcon
> = {
  'Wi-Fi': WifiIcon,
  Kitchen: CookingPot,
  'Free parking': CarIcon,
  'Air conditioning': AirVent,
  Heating: Heater,
  Washer: WashingMachine,
  Dryer: WashingMachine,
  TV: Tv2,
  Pool: Waves,
};
export function Amenity({ name }: { name: string }) {
  const Icon = amenitiesToIcons[name] ?? CheckIcon;

  return (
    <div className='flex items-center gap-2'>
      <Icon className='w-4 h-4' />
      {name}
    </div>
  );
}
