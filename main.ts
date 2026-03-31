import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './angular/src/app/app.component';
import { appConfig } from './angular/src/app/app.config';
import './packages/core/src/worker/worker';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
