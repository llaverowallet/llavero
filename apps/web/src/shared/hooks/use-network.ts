import SettingsStore from '@/store/settingsStore';
import { useSnapshot } from 'valtio';

const useNetwork = () => {
  const { network } = useSnapshot(SettingsStore.state);

  return {
    network,
  };
};

export { useNetwork };
