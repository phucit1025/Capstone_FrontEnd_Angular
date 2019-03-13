import {Component, OnInit, ViewChild} from '@angular/core';
import {ScheduleService} from '../../page-services/schedule.service';
import {combineLatest} from 'rxjs';
import {GLOBAL} from '../../global';
import {DurationComponent} from './duration/duration.component';
import {NzMessageService} from 'ng-zorro-antd';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})

export class ScheduleComponent implements OnInit {
  @ViewChild('duration') duration: DurationComponent;
  loadingId: any;
  date: Date;
  isVisible = false;
  rooms: any;
  selectedObject: any;
  selected = {
    firstShiftId: null,
    secondShiftId: null
  };
  state = {
    searchText: '',
    swapMode: false,
    load: false,
    finish: false,
    reload: false
  };

  constructor(private schedule: ScheduleService, private messageService: NzMessageService) {
  }

  ngOnInit() {
    this.date = new Date('3/13/2019');
    this.getSchedule();
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
    this.state.load = true;
    this.schedule.getSurgery().subscribe((rooms: any) => {
      this.rooms = rooms;
      if (rooms && rooms.length > 0) {
        this.scheduleForEachRoom(rooms, GLOBAL.convertDate(date ? date : this.date));
      }
    });
  }

  scheduleForEachRoom(rooms: Array<any>, date, load = false) {
    if (load) {
      this.state.load = true;
      this.state.reload = false;
    }
    const array = [];
    // Convert list roomId to list api function
    rooms.map(el => {
      array.push(this.schedule.getSurgeryByRoomAndDate(el.id, date));
    });
    const result = combineLatest(array);
    result.subscribe(el => {
      el.forEach((response, i) => {
        this.state.load = false;
        this.state.finish = true;
        this.rooms[i].surgery = response;
      }, er => {
        this.state.load = false;
      });
    }, er => {
      this.state.load = false;
    });
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
        this.messageService.create('success', `<p style="padding: 10px 0; font-weight: bold"><b>Swap successful</b></p>`);
        this.getSchedule(this.date);
        this.selected = {
          firstShiftId: null,
          secondShiftId: null
        };
      }, er => {
        this.state.load = false;
        this.messageService.create('error', `<p  style="padding: 10px 0; font-weight: bold"><b>Error!!! Cannot swap</b></p>`);
      });
    }
  }

  dropNode(node) {
    let parent = node.nativeEvent.target;
    while (parent.className.indexOf('room-detail-container') === -1) {
      parent = parent.parentNode;
    }
    console.log(parent.getAttribute('id'));
    this.showLoader();
    setTimeout(() => {
      this.removeLoader();
    }, 3000);
  }

  getScope(current) {
    const listId = this.rooms.map(r => {
      return r.id + '';
    });
    const index = listId.indexOf(current.id + '');
    listId.splice(index, 1);
    return listId;
  }
}
