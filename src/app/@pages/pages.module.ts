import {NgModule} from '@angular/core';
import {CommonModule, registerLocaleData} from '@angular/common';
import {ScheduleComponent} from './schedule/schedule.component';
import {PagesRouting} from './pages.routing';
import {LayoutComponent} from './layout/layout.component';
import {NgZorroAntdModule, NZ_I18N, vi_VN} from 'ng-zorro-antd';
import {FormsModule} from '@angular/forms';
import vi from '@angular/common/locales/vi';
import { DurationComponent } from './schedule/duration/duration.component';
import { ScheduleCardComponent } from './schedule/schedule-card/schedule-card.component';
import {NgDragDropModule} from 'ng-drag-drop';
import {RoomPipe} from '../pipe/room.pipe';
import { ImportFileComponent } from './import-file/import-file.component';

registerLocaleData(vi);

@NgModule({
  declarations: [ScheduleComponent, LayoutComponent, DurationComponent, ScheduleCardComponent, RoomPipe, ImportFileComponent],
  imports: [
    CommonModule,
    PagesRouting,
    FormsModule,
    NgZorroAntdModule,
    NgDragDropModule.forRoot(),
  ],
  providers: [{provide: NZ_I18N, useValue: vi_VN}],
})
export class PagesModule {
}
