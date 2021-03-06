import {Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {ScheduleService} from '../../../page-services/schedule.service';
import {NzMessageService} from 'ng-zorro-antd';
import {GLOBAL} from '../../../global';
import {combineLatest} from 'rxjs';

@Component({
  selector: 'app-duration',
  templateUrl: './duration.component.html',
  styleUrls: ['./duration.component.css']
})
export class DurationComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Input() groupId = -1;
  @Output() detectChanges = new EventEmitter();
  date = {
    startDate: new Date(),
    endDate: new Date()
  };
  roomList: any;
  state = {
    load: false,
    finish: false,
  };

  constructor(private schedule: ScheduleService, private message: NzMessageService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      if (this.data) {
        this.date = {
          startDate: new Date(this.data.estimatedStartDateTime),
          endDate: new Date(this.data.estimatedEndDateTime)
        };
      }
    }
  }

  ngOnInit() {
  }

  getAvailableRoom(type: boolean) {
    if (this.date.startDate && this.date.endDate) {
      const data = GLOBAL.parseObject({
        startDate: this.date.startDate,
        endDate: this.date.endDate,
        forcedChange: type,
        specialtyGroupId: this.groupId
      });
      if (data) {
        this.state.load = true;
        this.state.finish = false;
        this.schedule.getGetAvailableRoom(data).subscribe((list: any) => {
          const array = [];
          this.roomList = [];
          list.forEach(any => {
            array.push(this.schedule.getRoomInfo(any));
          });
          if (array.length === 0) {
            this.state.load = false;
            this.state.finish = true;
          } else {
            const result = combineLatest(array);
            result.subscribe(el => {
              this.state.load = false;
              this.state.finish = true;
              el.forEach((room) => {
                this.roomList.push(room);
              }, er => {
                this.state.load = false;
              });
            }, er => {
              this.state.load = false;
            });
          }
        }, er => {
          this.state.load = false;
          this.message.create('error', `<p>${er.status === 400 ? er.error : 'Cannot load'}</p>`);
        });
      }
    }
  }

  changeDate(date, type) {
    type === 's' ? this.date.startDate = date : this.date.endDate = date;
    this.roomList = null;
    this.state.finish = false;
  }


  disabled() {
    this.date = {
      startDate: new Date(),
      endDate: new Date(),
    };
    this.roomList = null;
    this.state.finish = false;
  }

  checkValid() {
    if (this.date.endDate && this.date.startDate) {
      const startTime = this.date.startDate.getHours() * 60 + this.date.startDate.getMinutes();
      const endTime = this.date.endDate.getHours() * 60 + this.date.endDate.getMinutes();
      return startTime >= endTime;
    }
    return true;
  }

  changeSchedule(room) {
    if (this.data.id !== -1 && room) {
      this.state.load = true;
      const data = {
        id: this.data.id,
        slotRoomId: room.id,
        estimatedStartDateTime: this.date.startDate,
        estimatedEndDateTime: this.date.endDate,
        changeLogDescription: '',
      };
      this.schedule.changeScheduleForDuration(GLOBAL.parseObject(data)).subscribe(res => {
        this.state.load = false;
        this.state.finish = false;
        this.roomList = null;
        this.detectChanges.emit();
        this.message.create('success', `<p style="padding: 10px 0; font-weight: bold"><b>Change successful</b></p>`);
      }, er => {
        this.state.load = false;
        this.message.create('error', `<p  style="padding: 10px 0; font-weight: bold"><b>Error!!! Cannot change</b></p>`);
      });
    }
  }
}
