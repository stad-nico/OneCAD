import { signal } from '@angular/core';
import { Project } from './project';

export const projects = signal<Array<Project>>([]);
