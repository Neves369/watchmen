import { create } from "zustand";
import { produce } from "immer";

type State = {
  portas: any[],
  timeout: number,
  historico: any[],

};

export const global = create<State>((set, get) => ({
    portas: [22, 80, 443, 8080],
    timeout: 5000,
    historico: []
}));


export const updateStore = function (updater: (state: State) => void) {
  global.setState(produce(global.getState(), updater));
};


export function clearStates() {
  updateStore((state) => {
    state.portas = [];
    state.timeout = 5000;
    state.historico= [];
  })    
}
 