import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ScheduleComponent} from './schedule/schedule.component';
import {LayoutComponent} from './layout/layout.component';
import {ImportFileComponent} from './import-file/import-file.component';
import {ScheduleDetailComponent} from './schedule-detail/schedule-detail.component';
import {ErrorsComponent} from './errors/errors.component';
import {AuthGuardService} from '../page-services/auth-guard.service';
import {ConfirmMedicalComponent} from './confirm-medical/confirm-medical.component';
import {SpecialtyComponent} from './specialty/specialty.component';
import {RoomSpecialtyGroupComponent} from './room-specialty-group/room-specialty-group.component';
import { StatisticComponent } from './statistic/statistic.component';
import { HealthcareManagementComponent } from './healthcare-management/healthcare-management.component';
import {PostopStatisticalComponent} from './postop-statistical/postop-statistical.component';
const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    data: {
      title: 'EBSMS'
    },
    canActivate: [AuthGuardService],
    canActivateChild: [AuthGuardService],
    children: [
      {
        path: 'import-file',
        component: ImportFileComponent,
        data: {
          roles: ['HospitalStaff'],
          title: 'Import File'
        },
      },
      {
        path: 'confirm-medical',
        component: ConfirmMedicalComponent,
        data: {
          roles: ['MedicalSupplier'],
          title: 'Confirm Medical Supply Request'
        },
      },
      {
        path: 'schedule',
        component: ScheduleComponent,
        data: {
          roles: ['ChiefNurse', 'Technical'],
          title: 'Schedule'
        }
      },
      {
        path: 'schedule-detail/:id',
        component: ScheduleDetailComponent,
        data: {
          roles: ['ChiefNurse', 'Technical'],
          title: 'Schedule'
        },
      },
      {
        path: 'specialty',
        component: SpecialtyComponent,
        data: {
          roles: ['ChiefNurse'],
          title: 'Specialty'
        }
      },
      {
        path: 'error',
        component: ErrorsComponent,
        data: {
          roles: [],
          title: 'Error'
        },
      },
      {
        path: 'room-specialty-group',
        component: RoomSpecialtyGroupComponent,
        data: {
          roles: ['ChiefNurse'],
          title: 'Room Specialty Group'
        },
      },
      {
        path: 'statistic',
        component: StatisticComponent,
        data: {
          roles: ['ChiefNurse'],
          title: 'Statistic'
        },
      },
      {
        path: 'healthcare-management',
        component: HealthcareManagementComponent,
        data: {
          roles: ['ChiefNurse'],
          title: 'Healthcare Management'
        },
      },
      {
        path: 'postop-statistical',
        component: PostopStatisticalComponent,
        data: {
          roles: ['ChiefNurse'],
          title: 'Postop Statistical'
        },
      },
    ]
  },
  {
    path: 'error',
    component: ErrorsComponent
  },
  {
    path: '**',
    redirectTo: 'error',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRouting {
}
