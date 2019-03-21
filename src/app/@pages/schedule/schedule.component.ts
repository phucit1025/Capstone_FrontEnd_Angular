import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ScheduleService } from '../../page-services/schedule.service';
import { combineLatest } from 'rxjs';
import { GLOBAL } from '../../global';
import { DurationComponent } from './duration/duration.component';
import { NzMessageService } from 'ng-zorro-antd';
import { SwalComponent } from '@toverux/ngx-sweetalert2';
import swal from 'sweetalert2';
import * as moment from 'moment';

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
  isVisible = false;
  rooms: any;
  serverTime: any;
  selectedObject: any;
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
    finish: false,
    reload: false
  };

  constructor(private schedule: ScheduleService, private messageService: NzMessageService) {
  }

  ngOnInit() {
    this.date = new Date('3/19/2019');
    this.getSchedule();
    this.getServerTime();
  }

  ngOnDestroy() {
    if (this.state.interval) {
      clearInterval(this.state.interval);
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
    this.loadingId = this.messageService.loading('Action in progress', { nzDuration: 0 }).messageId;
  }

  removeLoader() {
    if (this.loadingId) {
      this.messageService.remove(this.loadingId);
      this.loadingId = null;
    }
  }

  getSchedule(date?: any) {
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
    // Convert list roomId to list api function
    room.slotRooms.map(slot => {
      array.push(this.schedule.getSurgeryShiftsByRoomAndDate(slot.id, date));
    });
    const result = combineLatest(array);
    result.subscribe(res => {
      room.slotRooms.forEach((slot, index) => {
        slot['surgeries'] = res[index];
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
      this.scheduleForEachRoom(this.rooms, GLOBAL.convertDate(this.date));
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
}
