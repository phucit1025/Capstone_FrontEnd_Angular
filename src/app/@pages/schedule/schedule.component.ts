import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ScheduleService} from '../../page-services/schedule.service';
import {combineLatest} from 'rxjs';
import {GLOBAL} from '../../global';
import {DurationComponent} from './duration/duration.component';
import {NzMessageService} from 'ng-zorro-antd';
import {SwalComponent} from '@toverux/ngx-sweetalert2';
import swal from 'sweetalert2';
import * as moment from 'moment';

import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})

export class ScheduleComponent implements OnInit, OnDestroy {

  @ViewChild('duration') duration: DurationComponent;
  @ViewChild('moveNodeconfirm') dialog: SwalComponent;
  loadingId: any;
  date: Date;
  emergencyForm: FormGroup;
  startItem: any;
  isVisible = false;
  isShowEmergency = false;
  isShowStartModal = false;
  rooms: any;
  serverTime: any;
  selectedObject: any;
  selectedTime: any;
  selectedRoom: any;
  selectedBed: any;
  roomType: any;
  selected = {
    firstShiftId: null,
    secondShiftId: null
  };
  cacheNode: any;
  state = {
    interval: null,
    searchText: '',
    swapMode: false,
    load: false,
    loadStart: false,
    finish: false,
    reload: false,
    create: false,
    loadSlotRoom: false,
    selectedStatus: [],
  };
  slotRooms: any;
  actualEndTimeError = false;
  constructor(private notification: NzNotificationService, private schedule: ScheduleService, private messageService: NzMessageService, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.date = new Date();
    this.getSchedule();
    this.createEmergencyForm();
    this.getServerTime();

  }

  ngOnDestroy() {
    if (this.state.interval) {
      clearInterval(this.state.interval);
    }
  }

  disabledStartDate = (startValue: Date): boolean => {
    if (!startValue || !this.emergencyForm.controls['endTime'].value) {
      return false;
    }
    return startValue.getTime() >= this.emergencyForm.controls['endTime'].value.getTime() || startValue.getTime() <= (new Date()).getTime();
  };

  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue || !this.emergencyForm.controls['startTime'].value) {
      return false;
    }
    return endValue.getTime() <= this.emergencyForm.controls['startTime'].value.getTime();
  };

  createEmergencyForm() {
    this.emergencyForm = this.fb.group({
      startTime: new FormControl(new Date(), Validators.required),
      endTime: new FormControl(new Date(), [Validators.required]),
      isForceAdd: new FormControl(false),
      isEmergency: new FormControl(true),
      slotRoomId: new FormControl()
    });
  }

  createShift() {
    if (this.emergencyForm.valid) {
      this.state.create = true;
      const value = GLOBAL.parseObject(this.emergencyForm.value);
      this.schedule.addEmergencyShift(value).subscribe(res => {
        this.messageService.success('Create Successful!!!');
        this.state.create = false;
        this.isShowEmergency = false;
        this.createEmergencyForm();
        this.getSchedule(this.date);
      }, er => {
        this.state.create = false;
        this.messageService.error('Create Fail!!!');
      });
    }
  }

  getServerTime() {
    this.schedule.getServerTime().subscribe(res => {
      this.serverTime = res;
      this.state.interval = setInterval(() => {
        this.showTime(this.serverTime);
      }, 1000);
    });
  }

  showLoader() {
    this.loadingId = this.messageService.loading('Action in progress', {nzDuration: 0}).messageId;
  }

  removeLoader() {
    if (this.loadingId) {
      this.messageService.remove(this.loadingId);
      this.loadingId = null;
    }
  }

  getSchedule(date?: any) {
    this.state.searchText = null;
    this.state.selectedStatus = [];
    this.state.load = true;
    this.schedule.getSlotRooms().subscribe((rooms: any) => {
      this.rooms = rooms;
      
      if (rooms && rooms.length > 0) {
        rooms.forEach(room => {
          this.scheduleForEachRoom(room, GLOBAL.convertDate(date ? date : this.date));
        });
      }
    });
  }

  scheduleForEachRoom(room: any, date, load = false) {
    if (load) {
      this.state.load = true;
      this.state.reload = false;
    }
    const array = [];
    //-------------Specialty--------------//
    this.schedule.getSpecialtyByRoomId(room.id).subscribe((specialties: any) => {
      room['specialties'] = specialties;
    });
    //-----------------------------------
    
    this.schedule.getReportByRoom(room.id, date ? date : GLOBAL.convertDate(this.date))
    .subscribe((reportRoom : any) => {
      room['totalShift'] = reportRoom['totalShift'];
      room['totalPre'] = reportRoom['totalPre'];
      room['totalIntra'] = reportRoom['totalIntra'];
      room['totalPost'] = reportRoom['totalPost'];
    });
    console.log(room);
    // Convert list roomId to list api function
    room.slotRooms.map(slot => {
      array.push(this.schedule.getSurgeryShiftsByRoomAndDate(slot.id, date));
    });
    const result = combineLatest(array);
    result.subscribe(res => {
      room.slotRooms.forEach((slot, index) => {
        slot['surgeries'] = res[index];
        //report
        let shift;
        for (let i = 0; i < slot['surgeries'].length; i++) {
          shift = slot['surgeries'][i];
          this.schedule.checkStatusPreviousSurgeryShift(shift.id).subscribe((result: any) => {
            slot['surgeries'][i]['isStart'] = result;
          });
        }
      });
      this.state.load = false;
      this.state.finish = true;
    }, er => {
      this.state.load = false;
    });
  }

  showTime(dateStr) {
    const date = new Date(dateStr);
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    s = s + 1;

    if (s === 0) {
      s = 0;
      ++m;
    }

    if (m === 60) {
      m = 0;
      ++h;
    }

    if (h === 24) {
      h = 0;
    }

    date.setHours(h);
    date.setMinutes(m);
    date.setSeconds(s);
    this.serverTime = moment(date).format('YYYY-MM-DDTHH:mm:ssZ');
  }

  changeDate(date: Date) {
    this.date = date;
    this.getSchedule(date);
  }

  cancel() {
    if (this.state.reload) {
      this.scheduleForEachRoom(this.rooms, GLOBAL.convertDate(this.date), true);
    }
    this.isVisible = false;
    this.selectedObject = null;
    this.duration.disabled();
  }

  openModal(block) {
    this.isVisible = true;
    this.selectedObject = block;
  }

  disabled() {
    this.state.swapMode = false;
    this.selected = {
      firstShiftId: null,
      secondShiftId: null
    };
  }

  swapShift() {
    if (this.selected.secondShiftId && this.selected.firstShiftId) {
      this.state.load = true;
      this.schedule.swapShift(this.selected).subscribe(res => {
        this.state.load = false;
        this.messageService.create('success', `<p style='padding: 10px 0; font-weight: bold'><b>Swap successful</b></p>`);
        this.getSchedule(this.date);
        this.selected = {
          firstShiftId: null,
          secondShiftId: null
        };
      }, er => {
        this.state.load = false;
        this.messageService.create('error', `<p  style='padding: 10px 0; font-weight: bold'><b>Error!!! Cannot swap</b></p>`);
      });
    }
  }

  dropNode(node) {
    let parent = node.nativeEvent.target;
    while (parent.className.indexOf('slot-container') === -1) {
      parent = parent.parentNode;
    }
    this.setNode({
      child: node.dragData,
      parent: parent.getAttribute('id')
    });
    this.dialog.show();
  }

  setNode(node) {
    this.cacheNode = node;
  }

  moveToRoom(type) {
    swal.close();
    const data = {
      shiftId: this.cacheNode.child.id,
      roomId: this.cacheNode.parent,
      forcedSwap: type
    };
    this.showLoader();
    this.schedule.moveRoom(data).subscribe(res => {
      this.removeLoader();
      this.getSchedule(this.date);
      this.setNode(null);
      this.messageService.success('Success Swap');
    }, er => {
      this.setNode(null);
      this.removeLoader();
      this.messageService.error('Fail!!! Try again');
    });
  }

  getScope(current) {
    const listId = [];
    this.rooms.forEach(room => {
      room.slotRooms.forEach(r => {
        listId.push(r.id + '');
      });
    });
    const index = listId.indexOf(current.id + '');
    listId.splice(index, 1);
    return listId;
  }

  openStartShift(data) {
    console.log(data);
    this.actualEndTimeError = false;
    switch (data.statusName) {
      case 'Preoperative':
        this.selectedObject = data;
        this.isShowStartModal = true;
        this.selectedTime = new Date(data.estimatedStartDateTime);
        break;
      case 'Intraoperative':
        this.selectedObject = data;
        this.isShowStartModal = true;
        this.selectedTime = new Date(data.estimatedEndDateTime);
        this.selectedRoom = null;
        this.selectedBed = null;
        this.roomType = '3';
        break;
      case 'Postoperative':
        break;
    }
    // this.checkActualEndTime();
  }

  startShift() {
    if (!this.actualEndTimeError) {
      switch (this.selectedObject.statusName) {
        case 'Preoperative':
          const Pdate = moment(this.date).format('YYYY-MM-DD');
          const Ptime = moment(this.selectedTime).format('HH:mm');

          this.schedule.setIntraoperativeStatus({
            shiftId: this.selectedObject.id,
            time: Pdate + ' ' + Ptime
          }).subscribe(sc => {
            this.schedule.refreshSurgeryShift(this.selectedObject.id).subscribe();
            this.messageService.success('Change Successful');
            this.isShowStartModal = false;
            this.getSchedule();
          }, er => {
            this.messageService.error('Change Fail');
          });
          break;
        case 'Intraoperative':
          const date = moment(this.date).format('YYYY-MM-DD');
          const time = moment(this.selectedTime).format('HH:mm');
          const bedPost = this.selectedBed;
          const roomPost = this.selectedRoom;
          const data = {
            actualEndDateTime: date + ' ' + time,
            shiftId: this.selectedObject.id
          } as any;
          if (bedPost) {
            data.bedPost = bedPost;
          }
          if (roomPost) {
            data.roomPost = roomPost;
          }
          data.roomType = this.roomType;
          this.schedule.setPostoperativeStatus(GLOBAL.parseUrlString(data)).subscribe(sc => {
            this.schedule.refreshSurgeryShift(this.selectedObject.id).subscribe();
            this.messageService.success('Change Successful');
            this.isShowStartModal = false;
            this.selectedObject = null;
            this.selectedTime = null;
            this.getSchedule();
          }, er => {
            this.messageService.error('Change Fail');
          });
          break;
        case 'Postoperative':
          break;
      }
    }
  }

  checkActualEndTime() {
    const selectedDate = new Date(this.selectedTime);
    const serverDate = new Date(this.serverTime);
    // this.actualEndTimeError = (serverDate.getHours() * 60 + serverDate.getMinutes())
    //   - (selectedDate.getHours() * 60 + selectedDate.getMinutes()) > 0;
    this.actualEndTimeError = false;
  }

  countResult(rooms) {
    if (!rooms || rooms[0] === -1) {
      return 0;
    }
    return rooms.reduce((count, room) => {
      return room.slotRooms.reduce((countSlot, slot) => {
        return countSlot += slot.surgeries.length;
      }, count);
    }, 0);
  }
}
