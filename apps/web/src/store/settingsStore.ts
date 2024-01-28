import { Chain, EIP155_CHAINS } from '@/data/EIP155Data';
import { Verify, SessionTypes } from '@walletconnect/types';
import { proxy } from 'valtio';

/**
 * Types
 */
interface State {
  testNets: boolean;
  account: number;
  eip155Address: string;
  relayerRegionURL: string;
  activeChainId: string;
  currentRequestVerifyContext?: Verify.Context;
  network: Chain;
  sessions: SessionTypes.Struct[];
}

/**
 * State
 */
const state = proxy<State>({
  testNets: typeof localStorage !== 'undefined' ? Boolean(localStorage.getItem('TEST_NETS')) : true,
  account: 0,
  activeChainId: '1',
  eip155Address: '',
  relayerRegionURL: '',
  network: EIP155_CHAINS[window.localStorage.getItem('eip155Address') || 'eip155:80001'],
  sessions: [],
});

/**
 * Store / Actions
 */
const SettingsStore = {
  state,

  setAccount(value: number) {
    state.account = value;
  },

  setEIP155Address(eip155Address: string) {
    state.eip155Address = eip155Address;
  },

  setActiveChainId(value: string) {
    state.activeChainId = value;
  },

  setCurrentRequestVerifyContext(context: Verify.Context) {
    state.currentRequestVerifyContext = context;
  },

  setNetwork(chain: Chain) {
    state.network = chain;
  },
  setSessions(sessions: SessionTypes.Struct[]) {
    state.sessions = sessions;
  },

  toggleTestNets() {
    state.testNets = !state.testNets;
    if (state.testNets) {
      localStorage.setItem('TEST_NETS', 'YES');
    } else {
      localStorage.removeItem('TEST_NETS');
    }
  },
};

export default SettingsStore;
