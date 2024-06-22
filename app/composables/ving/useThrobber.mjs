import { defineStore } from 'pinia';

export const useThrobber = defineStore('throbber', {
    state: () => ({
        counter: 0,
        workers: 0,
    }),
    actions: {
        working() {
            this.counter = 100;
            this.workers++;
        },
        done() {
            const self = this;
            self.workers--;
            if (self.workers < 1) {
                self.counter = 1;
                setTimeout(function () {
                    self.counter = 0;
                }, 200);
            }
        },
    },
});