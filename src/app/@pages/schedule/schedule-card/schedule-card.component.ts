import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.css']
})
export class ScheduleCardComponent implements OnInit {
  @Input() data;
  @Input() swapMode;
  @Input() selected;
  @Input() parentId;

  @Output() swapModeChange = new EventEmitter();
  @Output() selectedChange = new EventEmitter();
  @Output() clickCard = new EventEmitter();
  @Output() openModal = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
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
    return (this.selected.firstShiftId && this.selected.secondShiftId && this.data.id !== this.selected.firstShiftId && this.data.id !== this.selected.secondShiftId);
  }
}
