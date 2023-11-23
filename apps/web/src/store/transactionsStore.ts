import { proxy } from 'valtio';

/**
 * Types
 */
interface State {
  transactionsHashes: string[];
}

/**
 * State
 */
const state = proxy<State>({
  transactionsHashes: [],
});

/**
 * Store / Actions
 */
const TransactionsStore = {
  state,

  setTxHash(txHash: string) {
    state.transactionsHashes.push(txHash);
  },

  setTxHashes(txHashes: string[]) {
    state.transactionsHashes = txHashes;
  },
};

export default TransactionsStore;
