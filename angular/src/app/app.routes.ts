import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./main-view/main-view.component').then((m) => m.MainViewComponent),
	},
	{
		path: 'projects/:projectId',
		loadComponent: () => import('./main-view/main-view.component').then((m) => m.MainViewComponent),
	},
	{
		path: 'projects/:projectId/models/:modelId',
		loadComponent: () => import('./main-view/main-view.component').then((m) => m.MainViewComponent),
	},
	{ path: '**', redirectTo: '/' },
];
