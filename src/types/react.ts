import type { Dispatch, SetStateAction } from 'react';

export type SetStateFn<T> = Dispatch<SetStateAction<T>>;
