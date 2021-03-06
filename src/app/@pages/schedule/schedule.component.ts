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
import {UserService} from '../../page-services/user.service';

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
  showAffectedShift = false;
  affectData = [];
  isShowEmergency = false;
  isShowStartModal = false;
  rooms: any;
  serverTime: any;
  selectedObject: any;
  selectedTime: any;
  selectedRoom: any;
  selectedBed: any;
  statusId: any;
  selected = {
    specialtyGroupId: null,
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
  checkedGroups = [];
  slotRooms: any;
  groupsId = [];
  actualEndTimeError = false;

  constructor(
    private schedule: ScheduleService,
    private messageService: NzMessageService,
    private userSV: UserService,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    this.userSV.getUser.subscribe((user: any) => {
      this.date = new Date();
      this.createEmergencyForm();
      this.getServerTime();
      if (user.role === 'Technical') {
        this.getScheduleForTeachnical(user, this.date);
      } else {
        this.getSchedule();
      }
    });
  }

  check(id) {
    return this.checkedGroups.indexOf(id) !== -1;
  }

  checkChange(e) {
    e.checked = !e.checked;
    if (e.checked) {
      this.checkedGroups.push(e.id);
      this.checkedGroups = this.checkedGroups.filter(el => el !== -1);
    } else {
      this.checkedGroups = this.checkedGroups.filter(el => el !== e.id);
    }
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
    console.log(startValue.toUTCString());
    return startValue.getTime() <= (new Date()).getTime();
  };

  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue || !this.emergencyForm.controls['startTime'].value) {
      return false;
    }
    console.log(endValue.getTime() <= this.emergencyForm.controls['startTime'].value.getTime());
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
        if (res == false) {
          this.messageService.error('Create Fail!!!');
        } else {
          this.messageService.success('Create Successful!!!');
          this.state.create = false;
          this.isShowEmergency = false;
          this.createEmergencyForm();
          this.getSchedule(this.date);
        }
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
          if (room.specialtyGroupId !== null && this.groupsId.map(el => el.id).indexOf(room.specialtyGroupId) === -1) {
            this.groupsId.push({
              id: room.specialtyGroupId,
              name: room.specialtyGroupName
            });
          }
          this.scheduleForEachRoom(room, GLOBAL.convertDate(date ? date : this.date));
        });
      }
    });
  }

  getScheduleForTeachnical(user: any, date?: any) {
    this.state.searchText = null;
    this.state.selectedStatus = [];
    this.state.load = true;
    this.schedule.getSlotRooms().subscribe((rooms: any) => {
      this.rooms = rooms;
      if (rooms && rooms.length > 0) {
        rooms.forEach(room => {
          if (room.specialtyGroupId !== null && this.groupsId.map(el => el.id).indexOf(room.specialtyGroupId) === -1) {
            this.groupsId.push({
              id: room.specialtyGroupId,
              name: room.specialtyGroupName
            });
          }
          this.scheduleForEachRoomTechnical(user.id, room, GLOBAL.convertDate(date ? date : this.date));
        });
      }
    });
  }

  scheduleForEachRoomTechnical(userId: number, room: any, date, load = false,) {
    if (load) {
      this.state.load = true;
      this.state.reload = false;
    }
    const array = [];
    this.schedule.getSpecialtyByRoomId(room.id).subscribe((specialties: any) => {
      room['specialties'] = specialties;
    });
    this.schedule.getReportByRoom(room.id, date ? date : GLOBAL.convertDate(this.date))
      .subscribe((reportRoom: any) => {
        room['totalShift'] = reportRoom['totalShift'];
        room['totalPre'] = reportRoom['totalPre'];
        room['totalIntra'] = reportRoom['totalIntra'];
        room['totalPost'] = reportRoom['totalPost'];
      });
    // Convert list roomId to list api function
    room.slotRooms.map(slot => {
      array.push(this.schedule.getSurgeryShiftsByRoomAndDateForTechnical(slot.id, date, userId));
    });

    const result = combineLatest(array);
    result.subscribe(res => {
      room.slotRooms.forEach((slot, index) => {
        slot['surgeries'] = res[index];
        let shiftId;
        for (let i = 0; i < slot['surgeries'].length; i++) {
          shiftId = slot['surgeries'][i].id;
          this.schedule.checkStatusPreviousSurgeryShift(shiftId).subscribe((rs: any) => {
            slot['surgeries'][i]['isStart'] = rs;
          });
        }
      });
      this.state.load = false;
      this.state.finish = true;
    }, er => {
      this.state.load = false;
    });
  }

  scheduleForEachRoom(room: any, date, load = false) {
    if (load) {
      this.state.load = true;
      this.state.reload = false;
    }
    const array = [];
    this.schedule.getSpecialtyByRoomId(room.id).subscribe((specialties: any) => {
      room['specialties'] = specialties;
    });
    this.schedule.getReportByRoom(room.id, date ? date : GLOBAL.convertDate(this.date))
      .subscribe((reportRoom: any) => {
        room['totalShift'] = reportRoom['totalShift'];
        room['totalPre'] = reportRoom['totalPre'];
        room['totalIntra'] = reportRoom['totalIntra'];
        room['totalPost'] = reportRoom['totalPost'];
      });
    // Convert list roomId to list api function
    room.slotRooms.map(slot => {
      array.push(this.schedule.getSurgeryShiftsByRoomAndDate(slot.id, date));
    });

    const result = combineLatest(array);
    result.subscribe(res => {
      room.slotRooms.forEach((slot, index) => {
        slot['surgeries'] = res[index];
        let shiftId;
        for (let i = 0; i < slot['surgeries'].length; i++) {
          shiftId = slot['surgeries'][i].id;
          this.schedule.checkStatusPreviousSurgeryShift(shiftId).subscribe((rs: any) => {
            slot['surgeries'][i]['isStart'] = rs;
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
      this.getSchedule();
      this.state.reload = false;
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
      specialtyGroupId: null,
      firstShiftId: null,
      secondShiftId: null
    };
  }

  swapShift() {
    if (this.selected.secondShiftId && this.selected.firstShiftId) {
      this.state.load = true;
      this.schedule.swapShift(this.selected).subscribe((res: any) => {
        if (res && res.length > 0) {
          this.affectData = res;
          this.showAffectedShift = true;
        }
        this.state.load = false;
        this.messageService.create('success', `<p style='padding: 10px 0; font-weight: bold'><b>Swap successful</b></p>`);
        this.getSchedule(this.date);
        this.selected = {
          specialtyGroupId: null,
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
    this.schedule.moveRoom(data).subscribe((res: any) => {
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
        this.statusId = '3';
        break;
      case 'Postoperative':
        break;
    }
    // this.checkActualEndTime(data);
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
          data.statusId = this.statusId;
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

  checkActualEndTime(data) {
    const selectedDate = new Date(this.selectedTime);
    if (data.actualStartDateTime != null) {
      const actualStartDateTime = new Date(data.actualStartDateTime);
      this.actualEndTimeError = (selectedDate.getHours() * 60 + selectedDate.getMinutes())
        - (actualStartDateTime.getHours() * 60 + actualStartDateTime.getMinutes()) <= 0;
    }

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
