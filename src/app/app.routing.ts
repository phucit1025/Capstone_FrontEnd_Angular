import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuardService} from './page-services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pages',
    pathMatch: 'full'
  },
  {
    path: 'pages',
    loadChildren: 'src/app/@pages/pages.module#PagesModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'auth',
    loadChildren: 'src/app/@auth/auth.module#AuthModule',
  },
  {
    path: '**',
    redirectTo: 'auth',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,  {useHash: true})],
  exports: [RouterModule]
})
export class AppRouting {
}
