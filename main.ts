import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './angular/src/app/app.component';
import { appConfig } from './angular/src/app/app.config';
import './core/worker/worker';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

if (import.meta.hot) {
  import.meta.hot.accept('./models/box', async (newModule) => {
    console.log('Model changed — rebuilding...');

    const mod = newModule ?? (await import('./models/box'));
    const mesh = await mod.createBoxModel();

    console.log('Updating model in renderer...');
  });
}
