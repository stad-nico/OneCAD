import { signal } from '@angular/core';
import { Model } from '../api/model';

export const models = signal<Array<Model>>([]);
