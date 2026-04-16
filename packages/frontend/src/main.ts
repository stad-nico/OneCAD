import { bootstrapApplication } from '@angular/platform-browser';
import { Logger } from '@opentscad/types';
import { App } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch((err) => Logger.error(err));
