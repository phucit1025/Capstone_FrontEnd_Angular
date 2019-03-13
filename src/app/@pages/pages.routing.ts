import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ScheduleComponent} from './schedule/schedule.component';
import {LayoutComponent} from './layout/layout.component';
import {ImportFileComponent} from './import-file/import-file.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'import-file',
        component: ImportFileComponent
      },
      {
        path: 'schedule',
        component: ScheduleComponent
      },
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRouting {
}
