import {NgModule} from '@angular/core';
import {CommonModule, registerLocaleData} from '@angular/common';
import {ScheduleComponent} from './schedule/schedule.component';
import {PagesRouting} from './pages.routing';
import {LayoutComponent} from './layout/layout.component';
import {en_US, NgZorroAntdModule, NZ_I18N, vi_VN, NzCollapseModule} from 'ng-zorro-antd';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import en from '@angular/common/locales/en';
import {DurationComponent} from './schedule/duration/duration.component';
import {ScheduleCardComponent} from './schedule/schedule-card/schedule-card.component';
import {NgDragDropModule} from 'ng-drag-drop';
import {RoomPipe} from '../pipe/room.pipe';
import {ImportFileComponent} from './import-file/import-file.component';
import {ScheduleDetailComponent} from './schedule-detail/schedule-detail.component';
import {ErrorsComponent} from './errors/errors.component';
import {SweetAlert2Module} from '@toverux/ngx-sweetalert2';
import {ConfirmMedicalComponent} from './confirm-medical/confirm-medical.component';
import {TreatmentComponent} from './schedule-detail/treatment/treatment.component';
import {StatusPipe} from '../pipe/status.pipe';
import { SpecialtyComponent } from './specialty/specialty.component';
import {RoomSpecialtyGroupComponent} from './room-specialty-group/room-specialty-group.component';
import { SurgeonComponent } from './schedule-detail/surgeon/surgeon.component';
import { StatisticComponent } from './statistic/statistic.component';
import { HealthcareManagementComponent } from './healthcare-management/healthcare-management.component';
import { ConditionPipe } from '../pipe/condition.pipe';
import {PostopStatisticalComponent} from './postop-statistical/postop-statistical.component';

registerLocaleData(en);

@NgModule({
  declarations: [
    ScheduleComponent,
    LayoutComponent,
    DurationComponent,
    ScheduleCardComponent,
    RoomPipe,
    StatusPipe,
    ConditionPipe,
    ImportFileComponent,
    ScheduleDetailComponent,
    ErrorsComponent,
    ConfirmMedicalComponent,
    TreatmentComponent,
    SpecialtyComponent,
    RoomSpecialtyGroupComponent,
    SurgeonComponent,
    StatisticComponent,
    HealthcareManagementComponent,
    PostopStatisticalComponent
  ],
  imports: [
    CommonModule,
    PagesRouting,
    FormsModule,
    NgZorroAntdModule,
    ReactiveFormsModule,
    NgDragDropModule.forRoot(),
    SweetAlert2Module.forRoot({
      buttonsStyling: false,
      confirmButtonClass: 'ant-btn ant-btn-primary',
      cancelButtonClass: 'ant-btn ant-btn-default'
    })
  ],
  providers: [{provide: NZ_I18N, useValue: en_US}],
})
export class PagesModule {
}
