import {ScheduleService} from './../../../page-services/schedule.service';
import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd';
import {GLOBAL} from '../../../global';
import * as moment from 'moment';

@Component({
  selector: 'app-schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.css']
})
export class ScheduleCardComponent implements OnInit, AfterViewInit {
  @Input() data;
  @Input() swapMode;
  @Input() selected;
  @Input() parentId;
  @Input() groupId;
  @Input() date;

  @Output() swapModeChange = new EventEmitter();
  @Output() selectedChange = new EventEmitter();
  @Output() clickCard = new EventEmitter();
  @Output() openModal = new EventEmitter();
  @Output() statusChange = new EventEmitter();

  contentDiv: any;

  constructor(private router: Router, private schedule: ScheduleService, private message: NzMessageService) {
  }

  ngAfterViewInit(): void {
    this.contentDiv = document.getElementById('room-container');
  }

  ngOnInit() {
    console.log(this.data);
  }

  notHistoryDate() {
    if (!this.date) {
      return false;
    }
    const date = this.date.setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return date >= today;
  }

  chooseNode() {
    if (this.selected.firstShiftId === this.data.id) {
      this.selected.firstShiftId = null;
      return;
    }
    if (this.selected.secondShiftId === this.data.id) {
      this.selected.secondShiftId = null;
      return;
    }
    if (!this.selected.firstShiftId) {
      this.selected.firstShiftId = this.data.id;
      return;
    }
    if (!this.selected.secondShiftId) {
      this.selected.secondShiftId = this.data.id;
      return;
    }
  }

  canDisabled() {
    return (this.selected.specialtyGroupId === null
      || this.selected.specialtyGroupId !== this.groupId
      || this.selected.firstShiftId
      && this.selected.secondShiftId
      && this.data.id !== this.selected.firstShiftId
      && this.data.id !== this.selected.secondShiftId);
  }

  changeStatus() {
    this.statusChange.emit(this.data);
  }

  emitData(data) {
    const d = GLOBAL.copyObject(data);
    d.groupId = this.groupId;
    console.log(d);
    this.openModal.emit(d);
  }

  redirect() {
    this.router.navigate(['pages/schedule-detail', this.data.id]);
  }
}
